const jwt = require('jsonwebtoken');

function generateToken(userId)
{
    return jwt.sign(userId, 'abcd');
}
function getIdFromToken(token)
{
    return jwt.verify(token, 'abcd');
}
module.exports={
    generateToken,
    getIdFromToken
}