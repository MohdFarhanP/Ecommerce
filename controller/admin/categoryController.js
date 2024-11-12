const Category = require('../../model/categoryModel');



// Function to display the category page with pagination and sorting
const categoryPage = async (req, res) => {
    const limit = 7;
    const page = parseInt(req.query.page) || 1;
    const filterBy = req.query.filterBy || 'brandName';

    try {
        const sortOptions = {
            brandName: { brandName: 1 },
            displayType: { displayType: 1 },
            bandColor: { bandColor: 1 },
            isDelete: { isDelete: 1 },
        };

        const sort = sortOptions[filterBy] || { brandName: 1 }; // 
        const totalCategories = await Category.countDocuments();

        const categories = await Category.find({})
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalCategories / limit);

        res.render('admin/category', {
            category: categories,
            currentPage: page,
            totalPages,
            totalCategories,
            activePage: 'category',
            selectedFilter: filterBy,
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Server Error");
    }
};
// Function to add a new category, checking for duplicates
const addCategory = async (req, res) => {
    const { brandName, displayType, bandColor } = req.body;

    try {
        const existingCategory = await Category.findOne({ brandName, displayType, bandColor });

        if (existingCategory) {
            return res.status(400).json({
                errorMessage: 'Category with the same Brand, Display Type, and Band Color already exists.'
            });
        }

        const newCategory = new Category({
            brandName,
            displayType,
            bandColor
        });

        await newCategory.save();
        return res.status(200).json({ message: "Category added successfully" });
    } catch (err) {
        console.log("Adding error", err);
        return res.status(500).json({
            errorMessage: 'Server error occurred while adding category.'
        });
    }
};
// Function to edit an existing category
const editCategory = async (req, res) => {
    try {
        const { brandName, displayType, bandColor, id } = req.body;

        if (!brandName || !displayType || !bandColor) {
            return res.json({ error: 'All fields are required' });
        }

        const existingCategory = await Category.findOne({ brandName, _id: { $ne: id } });
        if (existingCategory) {
            return res.json({ error: 'Brand name already exists. Please choose a different one.' });
        }

        await Category.findByIdAndUpdate(id, { brandName, displayType, bandColor });
        res.json({ success: true });

    } catch (err) {
        console.error('Error on the edit category:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
// Function to delete a category by marking it as deleted
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: true }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
};
// Function to reactivate a previously deleted category
const activeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: false }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
}


module.exports = {
    categoryPage,
    addCategory,
    editCategory,
    deleteCategory,
    activeCategory
};