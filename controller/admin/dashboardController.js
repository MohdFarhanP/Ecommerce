const Products = require('../../model/products');
const Order = require('../../model/orderModel');


const dashboard = (req, res) => {
    res.render('admin/dashboard');
};
const getCategorySalesData = async (req, res) => {
    try {
        const categorySales = await Products.aggregate([
            {
                $match: { isDeleted: false } // Only count active products
            },
            {
                $unwind: "$category" // Decompose array of categories for products with multiple categories
            },
            {
                $group: {
                    _id: "$category", // Group by category ID
                    totalSales: { $sum: "$popularity" } // Replace with a relevant field for sales
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $project: {
                    categoryName: "$categoryDetails.brandName",
                    totalSales: 1
                }
            }
        ]);

        res.json(categorySales);
    } catch (error) {
        console.error("Error fetching category sales data:", error);
        res.status(500).json({ error: "Server error" });
    }
};
const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$products" },  // Deconstruct products array in each order
            { $match: { "paymentStatus": "Paid" } },  // Count only orders that have been paid
            {
                $group: {
                    _id: "$products.productId",  // Group by product ID
                    totalOrders: { $sum: "$products.quantity" }  // Sum up the quantity ordered
                }
            },
            { $sort: { totalOrders: -1 } },  // Sort by order count
            { $limit: 10 },  // Limit to top 10 products
            {
                $lookup: {  // Join with Products collection to get product details
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },  // Deconstruct product details array
            {
                $project: {
                    productName: "$productDetails.productName",
                    totalOrders: 1,
                    productPrice: "$productDetails.productPrice",
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling products" });
    }
};
const getTopSellingCategories = async (req, res) => {
    try {
        const topCategories = await Order.aggregate([
            { $unwind: "$products" },  // Unwind products in each order
            { $match: { paymentStatus: "Paid" } },  // Only count paid orders
            {
                $lookup: {  // Join with Products collection to get category details
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $unwind: "$productDetails.category" },  // Unwind categories within each product
            {
                $group: {
                    _id: "$productDetails.category",  // Group by category ID
                    totalOrders: { $sum: "$products.quantity" }  // Sum quantities for each category
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
            {
                $lookup: {  // Join with Category collection to get category names
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    categoryName: "$categoryDetails.brandName",  // Assuming "brandName" represents category name
                    totalOrders: 1
                }
            }
        ]);

        res.json(topCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling categories" });
    }
};
const getTopSellingBrands = async (req, res) => {
    try {
        const topBrands = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { paymentStatus: "Paid" } },  // Only count paid orders
            {
                $lookup: {  // Join with Products to get category/brand info
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $unwind: "$productDetails.category" },
            {
                $lookup: {  // Join with Category to get brand name
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "brandDetails"
                }
            },
            { $unwind: "$brandDetails" },
            {
                $group: {
                    _id: "$brandDetails.brandName",  // Group by brand name
                    totalOrders: { $sum: "$products.quantity" }  // Sum quantities for each brand
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
            {
                $project: {
                    brandName: "$_id",
                    totalOrders: 1
                }
            }
        ]);

        res.json(topBrands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling brands" });
    }
};
module.exports = {
    dashboard,
    getCategorySalesData,
    getTopSellingBrands,
    getTopSellingCategories,
    getTopSellingProducts,
}