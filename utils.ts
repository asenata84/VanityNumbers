const fs = require('fs')

const content = 'Some content!'

const convertWordToNumber = (word: string) => {
  if (!word) return '';

  return word
    .replace(/[a-c]/g, '2')
    .replace(/[d-f]/g, '3')
    .replace(/[g-i]/g, '4')
    .replace(/[j-l]/g, '5')
    .replace(/[m-o]/g, '6')
    .replace(/[p-s]/g, '7')
    .replace(/[t-v]/g, '8')
    .replace(/[w-z]/g, '9');
}

const generateNumberWordsObject = () => {
  const words = require('an-array-of-english-words')
    .filter((item: string) => (3 <= item.length && item.length <= 7))

  const wordNumbers: any = {};

  words?.forEach((word: string) => {
    const number = convertWordToNumber(word);
    if (wordNumbers[number]) {
      wordNumbers[number]?.push(word);
    } else {
      wordNumbers[number] = [word];
    }
  });

  fs.writeFile('./wordNumbers.txt', JSON.stringify(wordNumbers), (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
  });
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

  if (vanityNumbers?.length > 0) {
    return vanityNumbers.reduce((acc, item, index) => {
      acc[`VanityNumber${index + 1}`] = item;
      return acc;
    }, {} as any);
  }

  return {
    VanityNumber1: 'No vanity numbers were found',
  }
}

// generateNumberWordsObject();

// const testPhone = '+1 185 872 2665';
// const testPhone = '+11234567890';
const testPhone = '+16617313960';

console.log('%c =========== generateVanityNumbers() >>', 'color:#669851;font-size:12px', generateVanityNumbers(testPhone));
