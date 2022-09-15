module.exports.echo = async event => {
  return { statusCode: 200, body: JSON.stringify(event) };
}
