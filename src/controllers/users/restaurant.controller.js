import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import mongoose from "mongoose";
import restaurantType from "../../models/restaurantTypes.modal.js";
import serviceType from "../../models/serviceTypes.modal.js";
import businessType from "../../models/businessTypes.modal.js";
import cuisine from "../../models/cuisines.modal.js";
import dishType from "../../models/dishTypes.modal.js";
import dietType from "../../models/dietTypes.modal.js";

export const getRestaurantTypes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  if (req.query.search) {
    matchStage.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              language: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await restaurantType.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0
        ? "RESTAURANT_TYPES_FETCHED_SUCCESSFULLY"
        : "NO_RESTAURANT_TYPES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});

export const getServiceTypes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await serviceType.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0
        ? "SERVICE_TYPES_FETCHED_SUCCESSFULLY"
        : "NO_SERVICE_TYPES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});

export const getBusinessTypes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await businessType.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0
        ? "BUSINESS_TYPES_FETCHED_SUCCESSFULLY"
        : "NO_BUSINESS_TYPES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});

export const getCuisines = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await cuisine.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0 ? "CUISINES_FETCHED_SUCCESSFULLY" : "NO_CUISINES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});

export const getDishTypes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await dishType.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0
        ? "DISH_TYPES_FETCHED_SUCCESSFULLY"
        : "NO_DISH_TYPES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});

export const getDietTypes = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const matchStage = {
    status: "active",
  };

  const sortStage = {
    ["createdAt"]: -1,
  };

  const aggregation = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        types: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              description: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await dietType.aggregate(aggregation);

  const types = result[0]?.types || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      types.length > 0
        ? "DIET_TYPES_FETCHED_SUCCESSFULLY"
        : "NO_DIET_TYPES_FOUND",
      req.lang,
      types.length > 0
        ? {
            types,
            total_page: totalPages,
            current_page: page,
            total_records: totalCount,
            per_page: limit,
          }
        : null
    )
  );
});
