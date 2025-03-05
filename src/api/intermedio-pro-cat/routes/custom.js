module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/intermedio-pro-cats/multiple-categories',
            handler: 'intermedio.listProductsMultipleCategories',
            config: {
                auth: false,
            },
        },
    ],
}