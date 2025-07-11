```javascript
function main(rankingConfig, records) {
  // [START discoveryengine_v1_generated_RankService_Rank_async]
  /**
   * This snippet has been automatically generated and should be regarded as a code template only.
   * It will require modifications to work.
   * It may require correct/in-range values for request initialization.
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource name of the rank service config, such as
   *  `projects/{project_num}/locations/{location}/rankingConfigs/default_ranking_config`.
   */
  // const rankingConfig = 'abc123'
  /**
   *  The identifier of the model to use. It is one of:
   *  * `semantic-ranker-512@latest`: Semantic ranking model with maximum input
   *  token size 512.
   *  It is set to `semantic-ranker-512@latest` by default if unspecified.
   */
  // const model = 'abc123'
  /**
   *  The number of results to return. If this is unset or no bigger than zero,
   *  returns all results.
   */
  // const topN = 1234
  /**
   *  The query to use.
   */
  // const query = 'abc123'
  /**
   *  Required. A list of records to rank. At most 200 records to rank.
   */
  // const records = [1,2,3,4]
  /**
   *  If true, the response will contain only record ID and score. By default, it
   *  is false, the response will contain record details.
   */
  // const ignoreRecordDetailsInResponse = true
  /**
   *  The user labels applied to a resource must meet the following requirements:
   *  * Each resource can have multiple labels, up to a maximum of 64.
   *  * Each label must be a key-value pair.
   *  * Keys have a minimum length of 1 character and a maximum length of 63
   *    characters and cannot be empty. Values can be empty and have a maximum
   *    length of 63 characters.
   *  * Keys and values can contain only lowercase letters, numeric characters,
   *    underscores, and dashes. All characters must use UTF-8 encoding, and
   *    international characters are allowed.
   *  * The key portion of a label must be unique. However, you can use the same
   *    key with multiple resources.
   *  * Keys must start with a lowercase letter or international character.
   *  See Google Cloud
   *  Document (https://cloud.google.com/resource-manager/docs/creating-managing-labels#requirements)
   *  for more details.
   */
  // const userLabels = [1,2,3,4]

  // Imports the Discoveryengine library
  const {RankServiceClient} = require('@google-cloud/discoveryengine').v1;

  // Instantiates a client
  const discoveryengineClient = new RankServiceClient();

  async function callRank() {
    // Construct request
    const request = {
      rankingConfig,
      records,
    };

    // Run request
    const response = await discoveryengineClient.rank(request);
    console.log(response);
  }

  callRank();
  // [END discoveryengine_v1_generated_RankService_Rank_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
```