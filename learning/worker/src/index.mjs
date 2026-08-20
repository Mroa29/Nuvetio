import { createLearningHandler } from "./handler.mjs";

export default {
  async fetch(request, env) {
    return createLearningHandler({ db: env.LEARNING_DB, reviewToken: env.NUVETIO_REVIEW_TOKEN }).fetch(request);
  },
  async scheduled(_event, env) {
    return createLearningHandler({ db: env.LEARNING_DB, reviewToken: env.NUVETIO_REVIEW_TOKEN }).scheduled();
  },
};
