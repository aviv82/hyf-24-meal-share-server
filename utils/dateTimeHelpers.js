const CreateFromSqlString = (sqlString) => {
  var t,
    result = null;

  if (typeof sqlString === "string") {
    t = sqlString.split(/[- :]/);

    //when t[3], t[4] and t[5] are missing they defaults to zero
    result = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  }
  return result;
};

module.exports = CreateFromSqlString;
