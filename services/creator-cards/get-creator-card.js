const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');

const spec = `root {
  slug string<trim|minLength:5|maxLength:50>
  access_code? string<trim>
}`;

const parsedSpec = validator.parse(spec);

async function getCreatorCard(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);

  try {
    // 1. Find the card by slug where deleted is null
    const card = await CreatorCard.findOne({ query: { slug: data.slug, deleted: null } });

    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }
    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF02');
    }
    if (card.access_type === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_MISSING, 'AC03');
    }
    if (card.access_type === 'private' && data.access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_INVALID, 'AC04');
    }

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
      created: card.created,
      updated: card.updated,
      deleted: card.deleted,
    };
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = getCreatorCard;
