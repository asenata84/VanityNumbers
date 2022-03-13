import * as AWS from 'aws-sdk';

const fs = require('fs');

const ddb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

type VanityNumbersObj = {
  VanityNumber1?: string
  VanityNumber2?: string
  VanityNumber3?: string
  VanityNumber4?: string
  VanityNumber5?: string
}

const generateVanityNumbers = (inputPhone: string) => {
  const phone = inputPhone
    .trim()
    //.replace(/^\+[0-9]{1,3}(\s|\-)/, "") // exclude Country code
    .replace(/[-\s]/g, '');

  const decomposedPhoneArr = phone.split(/[0-1]/);
  const longestSequence = decomposedPhoneArr.reduce((a: string, b: string) => a.length > b.length ? a : b);
  const rawdata = fs.readFileSync('./resources/wordNumbers.txt');
  const dataMap = JSON.parse(rawdata);
  const vanityNumbers: string[] = [];

  const isVanityInArray = (vanityNumber: string) => vanityNumbers.includes(vanityNumber);

  for (let index = longestSequence.length; index >= 3; index--) {
    if (vanityNumbers.length >= 5) break;

    const fromEndKey = longestSequence.slice(-index);
    const fromStartKey = longestSequence.slice(0, index);

    let vanityNumber;

    dataMap[fromEndKey]?.map((item: string) => {
      if (vanityNumbers.length < 5) {
        vanityNumber = phone.replace(fromEndKey, ` ${item} `).trim();
        !isVanityInArray(vanityNumber) && vanityNumbers.push(vanityNumber);
      }
    });

    dataMap[fromStartKey]?.map((item: string) => {
      if (vanityNumbers.length < 5) {
        vanityNumber = phone.replace(fromStartKey, ` ${item} `).trim();
        !isVanityInArray(vanityNumber) && vanityNumbers.push(vanityNumber);
      }
    });
  }

  return vanityNumbers;
}

exports.handler = async (event: any) => {
  const inputPhone = event?.Details?.ContactData?.CustomerEndpoint?.Address || event?.Details?.ContactData?.SystemEndpoint?.Address;

  const vanityNumbers = generateVanityNumbers(inputPhone);

  // TODO store generated vanity numbers to dynamodb
  if (TABLE_NAME) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        phone: inputPhone,
        createdAt: Number(Date.now()),
        vanityNumbers: vanityNumbers,
      }
    };

    try {
      await ddb.put(params).promise();

      return vanityNumbers?.length > 0
        ? vanityNumbers.reduce((acc, item, index) => {
          acc[`VanityNumber${index + 1}`] = item;
          return acc;
        }, {} as any)
        : {
          VanityNumber1: 'Vanity numbers were not found',
        }
    } catch (error) {
      throw new Error(error as any);
    }
  }

  return {
    statusCode: 400,
    error: { message: "Bad Request" },
  }
};
