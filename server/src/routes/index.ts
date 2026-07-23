export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/resolve',
        handler: 'controller.resolve',
        config: {
          policies: [],
        },
      },
    ],
  },
};
