"use strict";
function isSolvable(nums) {
    if (nums.length === 1)
        return nums[0] === 24;
    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length; j++) {
            if (i === j)
                continue;
            const rest = nums.filter((_, k) => k !== i && k !== j);
            const a = nums[i];
            const b = nums[j];
            const rs = [a + b, a - b, a * b];
            if (b !== 0)
                rs.push(a / b);
            for (const r of rs) {
                if (r !== null && hasSolution([r, ...rest]))
                    return true;
            }
        }
    }
    return false;
}
function applyOperation(a, op, b) {
    let result = null;
    switch (op) {
        case '+':
            result = a + b;
            break;
        case '-':
            if (a >= b)
                result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            if (b !== 0)
                result = a / b;
            break;
    }
    return result;
}
//# sourceMappingURL=wakeupcall.js.map