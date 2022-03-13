"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const fs = require('fs');
const ddb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const generateVanityNumbers = (inputPhone) => {
    var _a, _b;
    const phone = inputPhone
        .trim()
        //.replace(/^\+[0-9]{1,3}(\s|\-)/, "") // exclude Country code
        .replace(/[-\s]/g, '');
    const decomposedPhoneArr = phone.split(/[0-1]/);
    const longestSequence = decomposedPhoneArr.reduce((a, b) => a.length > b.length ? a : b);
    const rawdata = fs.readFileSync('./resources/wordNumbers.txt');
    const dataMap = JSON.parse(rawdata);
    const vanityNumbers = [];
    const isVanityInArray = (vanityNumber) => vanityNumbers.includes(vanityNumber);
    for (let index = longestSequence.length; index >= 3; index--) {
        if (vanityNumbers.length >= 5)
            break;
        const fromEndKey = longestSequence.slice(-index);
        const fromStartKey = longestSequence.slice(0, index);
        let vanityNumber;
        (_a = dataMap[fromEndKey]) === null || _a === void 0 ? void 0 : _a.map((item) => {
            if (vanityNumbers.length < 5) {
                vanityNumber = phone.replace(fromEndKey, ` ${item} `).trim();
                !isVanityInArray(vanityNumber) && vanityNumbers.push(vanityNumber);
            }
        });
        (_b = dataMap[fromStartKey]) === null || _b === void 0 ? void 0 : _b.map((item) => {
            if (vanityNumbers.length < 5) {
                vanityNumber = phone.replace(fromStartKey, ` ${item} `).trim();
                !isVanityInArray(vanityNumber) && vanityNumbers.push(vanityNumber);
            }
        });
    }
    return vanityNumbers;
};
exports.handler = async (event) => {
    var _a, _b, _c, _d, _e, _f;
    const inputPhone = ((_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.Details) === null || _a === void 0 ? void 0 : _a.ContactData) === null || _b === void 0 ? void 0 : _b.CustomerEndpoint) === null || _c === void 0 ? void 0 : _c.Address) || ((_f = (_e = (_d = event === null || event === void 0 ? void 0 : event.Details) === null || _d === void 0 ? void 0 : _d.ContactData) === null || _e === void 0 ? void 0 : _e.SystemEndpoint) === null || _f === void 0 ? void 0 : _f.Address);
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
            return (vanityNumbers === null || vanityNumbers === void 0 ? void 0 : vanityNumbers.length) > 0
                ? vanityNumbers.reduce((acc, item, index) => {
                    acc[`VanityNumber${index + 1}`] = item;
                    return acc;
                }, {})
                : {
                    VanityNumber1: 'Vanity numbers were not found',
                };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    return {
        statusCode: 400,
        error: { message: "Bad Request" },
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUUvQixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRTlDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0FBVTFDLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7O0lBQ25ELE1BQU0sS0FBSyxHQUFHLFVBQVU7U0FDckIsSUFBSSxFQUFFO1FBQ1AsOERBQThEO1NBQzdELE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekIsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELE1BQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDL0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7SUFFbkMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxZQUFvQixFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXZGLEtBQUssSUFBSSxLQUFLLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxL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QUc7UUFDZixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFO0tBQ2xDLENBQUE7QUFDSCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XHJcblxyXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcblxyXG5jb25zdCBkZGIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XHJcblxyXG5jb25zdCBUQUJMRV9OQU1FID0gcHJvY2Vzcy5lbnYuVEFCTEVfTkFNRTtcclxuXHJcbnR5cGUgVmFuaXR5TnVtYmVyc09iaiA9IHtcclxuICBWYW5pdHlOdW1iZXIxPzogc3RyaW5nXHJcbiAgVmFuaXR5TnVtYmVyMj86IHN0cmluZ1xyXG4gIFZhbml0eU51bWJlcjM/OiBzdHJpbmdcclxuICBWYW5pdHlOdW1iZXI0Pzogc3RyaW5nXHJcbiAgVmFuaXR5TnVtYmVyNT86IHN0cmluZ1xyXG59XHJcblxyXG5jb25zdCBnZW5lcmF0ZVZhbml0eU51bWJlcnMgPSAoaW5wdXRQaG9uZTogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgcGhvbmUgPSBpbnB1dFBob25lXHJcbiAgICAudHJpbSgpXHJcbiAgICAvLy5yZXBsYWNlKC9eXFwrWzAtOV17MSwzfShcXHN8XFwtKS8sIFwiXCIpIC8vIGV4Y2x1ZGUgQ291bnRyeSBjb2RlXHJcbiAgICAucmVwbGFjZSgvWy1cXHNdL2csICcnKTtcclxuXHJcbiAgY29uc3QgZGVjb21wb3NlZFBob25lQXJyID0gcGhvbmUuc3BsaXQoL1swLTFdLyk7XHJcbiAgY29uc3QgbG9uZ2VzdFNlcXVlbmNlID0gZGVjb21wb3NlZFBob25lQXJyLnJlZHVjZSgoYTogc3RyaW5nLCBiOiBzdHJpbmcpID0+IGEubGVuZ3RoID4gYi5sZW5ndGggPyBhIDogYik7XHJcbiAgY29uc3QgcmF3ZGF0YSA9IGZzLnJlYWRGaWxlU3luYygnLi9yZXNvdXJjZXMvd29yZE51bWJlcnMudHh0Jyk7XHJcbiAgY29uc3QgZGF0YU1hcCA9IEpTT04ucGFyc2UocmF3ZGF0YSk7XHJcbiAgY29uc3QgdmFuaXR5TnVtYmVyczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgY29uc3QgaXNWYW5pdHlJbkFycmF5ID0gKHZhbml0eU51bWJlcjogc3RyaW5nKSA9PiB2YW5pdHlOdW1iZXJzLmluY2x1ZGVzKHZhbml0eU51bWJlcik7XHJcblxyXG4gIGZvciAobGV0IGluZGV4ID0gbG9uZ2VzdFNlcXVlbmNlLmxlbmd0aDsgaW5kZXggPj0gMzsgaW5kZXgtLSkge1xyXG4gICAgaWYgKHZhbml0eU51bWJlcnMubGVuZ3RoID49IDUpIGJyZWFrO1xyXG5cclxuICAgIGNvbnN0IGZyb21FbmRLZXkgPSBsb25nZXN0U2VxdWVuY2Uuc2xpY2UoLWluZGV4KTtcclxuICAgIGNvbnN0IGZyb21TdGFydEtleSA9IGxvbmdlc3RTZXF1ZW5jZS5zbGljZSgwLCBpbmRleCk7XHJcblxyXG4gICAgbGV0IHZhbml0eU51bWJlcjtcclxuXHJcbiAgICBkYXRhTWFwW2Zyb21FbmRLZXldPy5tYXAoKGl0ZW06IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAodmFuaXR5TnVtYmVycy5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgdmFuaXR5TnVtYmVyID0gcGhvbmUucmVwbGFjZShmcm9tRW5kS2V5LCBgICR7aXRlbX0gYCkudHJpbSgpO1xyXG4gICAgICAgICFpc1Zhbml0eUluQXJyYXkodmFuaXR5TnVtYmVyKSAmJiB2YW5pdHlOdW1iZXJzLnB1c2godmFuaXR5TnVtYmVyKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGF0YU1hcFtmcm9tU3RhcnRLZXldPy5tYXAoKGl0ZW06IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAodmFuaXR5TnVtYmVycy5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgdmFuaXR5TnVtYmVyID0gcGhvbmUucmVwbGFjZShmcm9tU3RhcnRLZXksIGAgJHtpdGVtfSBgKS50cmltKCk7XHJcbiAgICAgICAgIWlzVmFuaXR5SW5BcnJheSh2YW5pdHlOdW1iZXIpICYmIHZhbml0eU51bWJlcnMucHVzaCh2YW5pdHlOdW1iZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiB2YW5pdHlOdW1iZXJzO1xyXG59XHJcblxyXG5leHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gIGNvbnN0IGlucHV0UGhvbmUgPSBldmVudD8uRGV0YWlscz8uQ29udGFjdERhdGE/LkN1c3RvbWVyRW5kcG9pbnQ/LkFkZHJlc3MgfHwgZXZlbnQ/LkRldGFpbHM/LkNvbnRhY3REYXRhPy5TeXN0ZW1FbmRwb2ludD8uQWRkcmVzcztcclxuXHJcbiAgY29uc3QgdmFuaXR5TnVtYmVycyA9IGdlbmVyYXRlVmFuaXR5TnVtYmVycyhpbnB1dFBob25lKTtcclxuXHJcbiAgLy8gVE9ETyBzdG9yZSBnZW5lcmF0ZWQgdmFuaXR5IG51bWJlcnMgdG8gZHluYW1vZGJcclxuICBpZiAoVEFCTEVfTkFNRSkge1xyXG4gICAgY29uc3QgcGFyYW1zID0ge1xyXG4gICAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICAgIEl0ZW06IHtcclxuICAgICAgICBwaG9uZTogaW5wdXRQaG9uZSxcclxuICAgICAgICBjcmVhdGVkQXQ6IE51bWJlcihEYXRlLm5vdygpKSxcclxuICAgICAgICB2YW5pdHlOdW1iZXJzOiB2YW5pdHlOdW1iZXJzLFxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGRkYi5wdXQocGFyYW1zKS5wcm9taXNlKCk7XHJcblxyXG4gICAgICByZXR1cm4gdmFuaXR5TnVtYmVycz8ubGVuZ3RoID4gMFxyXG4gICAgICAgID8gdmFuaXR5TnVtYmVycy5yZWR1Y2UoKGFjYywgaXRlbSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgIGFjY1tgVmFuaXR5TnVtYmVyJHtpbmRleCArIDF9YF0gPSBpdGVtO1xyXG4gICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICB9LCB7fSBhcyBhbnkpXHJcbiAgICAgICAgOiB7XHJcbiAgICAgICAgICBWYW5pdHlOdW1iZXIxOiAnVmFuaXR5IG51bWJlcnMgd2VyZSBub3QgZm91bmQnLFxyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvciBhcyBhbnkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN0YXR1c0NvZGU6IDQwMCxcclxuICAgIGVycm9yOiB7IG1lc3NhZ2U6IFwiQmFkIFJlcXVlc3RcIiB9LFxyXG4gIH1cclxufTtcclxuIl19