const CreatorCardMessages = {
  // Success
  CARD_CREATED: 'Creator Card Created Successfully.',
  CARD_RETRIEVED: 'Creator Card Retrieved Successfully.',
  CARD_DELETED: 'Creator Card Deleted Successfully.',

  // Slug
  SLUG_TAKEN: 'Slug is already taken',

  // Access code
  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',
  ACCESS_CODE_NOT_ALLOWED: 'access_code can only be set on private cards',
  ACCESS_CODE_MISSING: 'This card is private. An access code is required',
  ACCESS_CODE_INVALID: 'Invalid access code',

  // Not found
  CARD_NOT_FOUND: 'Creator card not found',
  CARD_IS_DRAFT: 'Creator card not found',
};

module.exports = CreatorCardMessages;
