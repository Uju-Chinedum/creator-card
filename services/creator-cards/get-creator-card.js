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
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'CC01');
    }
    // 2. Apply access rules in order (NF01 → NF02 → AC03 → AC04)
    // YOUR CODE HERE
    // 3. Build response — omit access_code entirely
    // YOUR CODE HERE
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = getCreatorCard;
