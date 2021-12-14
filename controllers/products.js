const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  //const search = "ab";
  const products = await Product.find({ price: { $gt: 30 } })
    .sort("price")
    .select("name price")
    .limit(4)
    .skip(1);
  // const products = await Product.find({}).sort("name").select("name price").limit(4).skip(1); // skips the first item
  // const products = await Product.find({}).sort("name").select("name price").limit(4); // limits to 4
  // const products = await Product.find({}).select("name price").limit(4);
  //const products = await Product.find({}).select("name price"); // select property
  // const products = await Product.find({}).sort("-name price");
  //const products = await Product.find({}).sort("-name"); // sort Property
  // const products = await Product.find({}).sort("name");
  //const products = await Product.find({name: { $regex: search, $options: "i" }, // i means case insensitive});
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  // req.query -> {"key":"value"}
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  console.log("queryObj", queryObject);
  let result = Product.find(queryObject);

  // S O R T   F U N C T I O N A L I T Y
  if (sort) {
    //console.log(sort);
    const sortList = sort.split(",").join(" ");
    console.log(sortList);
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  // S E L E C T  F U N C T I O N A L I T Y
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  // P A G I N A T I O N
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);
  const products = await result;
  console.log(products);
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
