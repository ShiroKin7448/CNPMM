const mongoose = require("mongoose");
const Counselor = require("../models/Counselor");
const Availability = require("../models/Availability");
const Schedule = require("../models/Schedule");
const CounselorReview = require("../models/CounselorReview");
const { ACTIVE_SCHEDULE_STATUSES } = require("../services/scheduleService");
const { attachCounselorStats } = require("../services/counselorStatsService");

const DEFAULT_REVIEW_PAGE = 1;
const DEFAULT_REVIEW_LIMIT = 10;
const MAX_REVIEW_LIMIT = 50;

const COUNSELOR_PROFILE_FIELDS = [
  "fullName",
  "expertise",
  "bio",
  "image",
  "hourlyRate",
  "isActive",
];

const pickCounselorFields = (body = {}) =>
  COUNSELOR_PROFILE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

const isValidCounselorId = (id) => mongoose.isObjectIdOrHexString(id);

const sendCounselorNotFound = (res) =>
  res.status(404).json({ message: "Không tìm thấy tư vấn viên" });

const toPositiveInteger = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }
  return Math.min(parsedValue, max);
};

// Get all counselors
exports.getAllCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find({ isActive: true })
      .populate("availability")
      .sort("-createdAt");
    res.json(await attachCounselorStats(counselors));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counselor by ID
exports.getCounselorById = async (req, res) => {
  try {
    if (!isValidCounselorId(req.params.id)) {
      return sendCounselorNotFound(res);
    }
    const counselor = await Counselor.findById(req.params.id).populate(
      "availability",
    );
    if (!counselor) {
      return sendCounselorNotFound(res);
    }
    const [withStats] = await attachCounselorStats([counselor]);
    res.json(withStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildSimilarCounselorQuery = (counselor) => {
  const expertise = counselor.expertise || [];
  const baseQuery = { isActive: true, _id: { $ne: counselor._id } };
  if (expertise.length > 0) {
    baseQuery.expertise = { $in: expertise };
  }
  return baseQuery;
};

exports.getSimilarCounselors = async (req, res) => {
  try {
    if (!isValidCounselorId(req.params.id)) {
      return sendCounselorNotFound(res);
    }
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return sendCounselorNotFound(res);
    }
    const query = buildSimilarCounselorQuery(counselor);
    const candidates = await Counselor.find(query)
      .sort({ rating: -1, totalBookings: -1, hourlyRate: 1 })
      .limit(6)
      .populate("availability");
    res.json(await attachCounselorStats(candidates));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCounselorStats = async (req, res) => {
  try {
    if (!isValidCounselorId(req.params.id)) {
      return sendCounselorNotFound(res);
    }
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return sendCounselorNotFound(res);
    }
    const [withStats] = await attachCounselorStats([counselor]);
    res.json({ stats: withStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCounselorReviews = async (req, res) => {
  try {
    if (!isValidCounselorId(req.params.id)) {
      return sendCounselorNotFound(res);
    }

    const counselorExists = await Counselor.exists({ _id: req.params.id });
    if (!counselorExists) {
      return sendCounselorNotFound(res);
    }

    const page = toPositiveInteger(req.query.page, DEFAULT_REVIEW_PAGE);
    const limit = toPositiveInteger(
      req.query.limit,
      DEFAULT_REVIEW_LIMIT,
      MAX_REVIEW_LIMIT,
    );
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      CounselorReview.find({ counselorId: req.params.id, comment: { $ne: "" } })
        .populate("userId", "username fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CounselorReview.countDocuments({
        counselorId: req.params.id,
        comment: { $ne: "" },
      }),
    ]);

    const safeReviews = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewer: r.userId?.fullName || r.userId?.username || "Sinh viên ẩn danh",
    }));

    res.json({ reviews: safeReviews, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create counselor
exports.createCounselor = async (req, res) => {
  const { userId, fullName, expertise, bio, image, hourlyRate } = req.body;

  const counselor = new Counselor({
    userId,
    fullName,
    expertise,
    bio,
    image,
    hourlyRate,
  });

  try {
    const newCounselor = await counselor.save();
    res.status(201).json(newCounselor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update counselor
exports.updateCounselor = async (req, res) => {
  try {
    if (!isValidCounselorId(req.params.id)) {
      return sendCounselorNotFound(res);
    }
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return sendCounselorNotFound(res);
    }

    Object.assign(counselor, pickCounselorFields(req.body));
    const updatedCounselor = await counselor.save();
    const [withStats] = await attachCounselorStats([updatedCounselor]);
    res.json(withStats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const counselorId = req.params.id; // ✅ Lấy counselorId từ URL path
    const { date } = req.query; // ✅ Lấy date từ query string

    if (!counselorId || !date) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn tư vấn viên và ngày cần xem lịch" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const availability = await Availability.findOne({
      counselorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability) {
      return res.json({ slots: [], bookedSlots: [] });
    }

    // Check for blackout dates
    const isBlackout = availability.blackoutDates.some((bd) => {
      const blackoutDate = new Date(bd.date);
      return blackoutDate.toDateString() === selectedDate.toDateString();
    });

    if (isBlackout) {
      return res.json({ slots: [], bookedSlots: [] });
    }

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedSlots = await Schedule.find({
      counselorId,
      status: { $in: ACTIVE_SCHEDULE_STATUSES },
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
    });

    const slots = [];
    const bookedSlotValues = [];
    const [startHour, startMin] = availability.startTime.split(":");
    const [endHour, endMin] = availability.endTime.split(":");

    let currentTime = new Date(selectedDate);
    currentTime.setHours(parseInt(startHour), parseInt(startMin), 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(
        slotStart.getTime() + availability.slotDuration * 60000,
      );
      const isBooked = bookedSlots.some(
        (booking) => booking.startTime < slotEnd && booking.endTime > slotStart,
      );

      if (slotStart > new Date() && !isBooked && slotEnd <= endTime) {
        slots.push(slotStart);
      } else if (isBooked && slotEnd <= endTime) {
        bookedSlotValues.push(slotStart);
      }
      currentTime = new Date(
        currentTime.getTime() + availability.slotDuration * 60000,
      );
    }

    res.json({
      slots,
      bookedSlots: bookedSlotValues,
      slotDuration: availability.slotDuration,
      workStart: availability.startTime,
      workEnd: availability.endTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
