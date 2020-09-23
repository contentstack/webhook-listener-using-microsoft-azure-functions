// Module dependencies

const axios = require("axios");

/*
* baseUrl option's
* European (https://eu-api.contentstack.com/)
* North America (https://api.contentstack.io/)
*/

//Environment variables

const { managementToken, apiKey, baseUrl } = process.env;

//Fetch entry handler

const getEntry = async (contentTypeUid, uid) => {
  var options = {
    method: "GET",
    json: true,
    headers: {
      "content-Type": "application/json",
      Authorization: managementToken,
      api_key: apiKey,
    },
  };
  let response = await axios(
    `${baseUrl}v3/content_types/${contentTypeUid}/entries/${uid}`,
    options
  );
  let { date, priority } = response.data.entry;
  let sortOrderField = date + "-" + priority;
  if (sortOrderField !== response.data.entry.sort_order) {
    return Promise.resolve(sortOrderField);
  } else {
    return null;
  }
};

// Update entry handler

const updateEntry = async (sortOrderField, contentTypeUid, uid) => {
  var options = {
    method: "PUT",
    data: {
      entry: {
        sort_order: sortOrderField,
      },
    },
    json: true,
    headers: {
      "content-Type": "application/json",
      Authorization: managementToken,
      api_key: apiKey,
    },
  };
  return axios(
    `${baseUrl}v3/content_types/${contentTypeUid}/entries/${uid}`,
    options
  );
};

// Main handler

const sortUpdateHandler = async (contentTypeUid, entryUid) => {
  let entryInfo = await getEntry(contentTypeUid, entryUid);
  if (entryInfo !== null) {
    await updateEntry(entryInfo, contentTypeUid, entryUid);
  }
};

module.exports = async function (context, req) {
  let body = req.body;
  try {
    await sortUpdateHandler(body.data.content_type.uid, body.data.entry.uid);
    context.res = {
      status: 200,
      body: "Success !!",
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
};
