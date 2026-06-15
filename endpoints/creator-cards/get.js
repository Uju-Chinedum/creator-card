const { createHandler } = require('@app-core/server');
const getCreatorCard = require('@app/services/creator-cards/get-creator-card');
const CreatorCardMessages = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],

  async handler(rc, helpers) {
    const payload = { ...rc.params, ...rc.query };

    const response = await getCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_RETRIEVED,
      data: response,
    };
  },
});
