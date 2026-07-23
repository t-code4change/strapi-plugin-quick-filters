export default {
  admin: [
    {
      method: 'GET',
      path: '/resolve',
      handler: 'controller.resolve',
      config: {
        policies: [],
      },
    },
  ],
};
