export const getTotalExcessiveDelayPersonHours = ({ data }) =>
  Array.isArray(data)
    ? data.reduce(
        (acc, { phed, nhs }) => (+phed && +nhs === 1 ? acc + +phed : acc),
        0
      )
    : null;
