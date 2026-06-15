const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');

const spec = `root {
  slug string<trim|minLength:5|maxLength:50>
  creator_reference string<trim>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);

  try {
    const card = await CreatorCard.findOne({ query: { slug: data.slug, deleted: null } });
    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }

    const now = Date.now();
    await CreatorCard.updateOne({
      query: { slug: data.slug },
      updateValues: { deleted: now, updated: now },
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
      updated: now,
      deleted: now,
    };
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
