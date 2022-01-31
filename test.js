const getEndDate = () => {
  const startedAt = new Date('2022-01-11T08:53:22Z').getTime();

  const endedAt = new Date(startedAt + 24 * 60 * 60 * 1000);

  // const realEnd = endedAt.toISOString();

  console.log(endedAt.toISOString());
  // new Date(endedAt).toISOString();
};

getEndDate();
