const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { ulid } = require('@app-core/randomness');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');

const spec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedSpec = validator.parse(spec);

function generateSlug(title) {
  let slug = title.toLowerCase();
  slug = slug.split(' ').join('-');

  const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
  let cleaned = '';
  for (let i = 0; i < slug.length; i++) {
    if (allowed.indexOf(slug[i]) !== -1) {
      cleaned += slug[i];
    }
  }

  return cleaned;
}

function generateSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += `${chars[Math.floor(Math.random() * chars.length)]}`;
  }
  return suffix;
}

async function createCreatorCard(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);

  try {
    // Resolve access_type default
    const accessType = data.access_type || 'public';

    // access_code required when private
    if (accessType === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
    }

    // access_code must not be set on public cards
    if (accessType === 'public' && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
    }

    // Resolve slug
    let slug;
    if (data.slug) {
      // Client provided slug
      const existing = await CreatorCard.findOne({ query: { slug: data.slug, deleted: null } });
      if (existing) {
        throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
      }
      slug = data.slug;
    } else {
      // Auto-generate from title
      let generated = generateSlug(data.title);

      if (generated.length < 5) {
        generated = `${generated}-${generateSuffix()}`;
      } else {
        const existing = await CreatorCard.findOne({ query: { slug: generated, deleted: null } });
        if (existing) {
          generated = `${generated}-${generateSuffix()}`;
        }
      }
      slug = generated;
    }

    const now = Date.now();
    const card = await CreatorCard.create({
      _id: ulid(),
      title: data.title,
      description: data.description || null,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      status: data.status,
      access_type: accessType,
      access_code: data.access_code || null,
      created: now,
      updated: now,
      deleted: null,
    });

    response = {
      id: card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: card.links,
      service_rates: card.service_rates,
      status: card.status,
      access_type: card.access_type,
      access_code: card.access_code,
      created: card.created,
      updated: card.updated,
      deleted: card.deleted,
    };
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;
