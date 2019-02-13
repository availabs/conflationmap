const textSearch = ({ id, value }, row) => {
  if (!value) {
    return true;
  }

  if (!row[id]) {
    return false;
  }

  return row[id].toLowerCase().includes(value.toLowerCase());
};

export default textSearch
