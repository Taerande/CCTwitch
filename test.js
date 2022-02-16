// const getEndDate = () => {
//   const startedAt = new Date('2022-01-11T08:53:22Z').getTime();

//   const endedAt = new Date(startedAt + 24 * 60 * 60 * 1000);

//   // const realEnd = endedAt.toISOString();

//   console.log(endedAt.toISOString());
//   // new Date(endedAt).toISOString();
// };

// getEndDate();

const num = '12345678901';

const process = (el) => {
  console.log('length:', el.length);
  console.log('origin:', el);
  console.log('processed:', `${num.slice(0, -9)},${num.slice(num.length - 9, -6)},${num.slice(num.length - 6, -3)},${num.slice(-3)}`);
};

process(num);
