export const businessData = {
  business_info: {
    name: "Alameen Studios",
    location: "Hadejia Road Opposite MTN Office, Kano, Nigeria",
    phone: "07034738900",
    instagram: "@alameenstudios",
  },
  general_studio_policies: {
    booking_deposit_percentage: 60,
    lateness_fee_per_30_mins: 10000,
    extra_photo_cost_per_copy: 4000,
    refund_policy: "No refund or cancellation of shoots",
    turnaround_time_working_days: "3-5 days after initial selection",
    express_service_charge_percentage: 20,
    express_service_turnaround_days: "1-2 days",
    additional_charges: [
      "Unmarked photos (Edited photos without logo)",
      "Collection of raw pictures",
    ],
  },
  wedding_policies: {
    turnaround_time: "2-3 weeks",
    deposit_policy: "Non-refundable deposit required for confirmation",
    payment_rule: "Full payments required on or before scheduled date",
    pricing_note:
      "Rates are per event, not per day. Discounts may apply for multiple day bookings.",
    exclusions: [
      "Bringing backdrops (extra cost)",
      "Travel and accommodation costs",
    ],
    validity: "Rates valid for 4 months from receipt",
  },
  packages: {
    studio_package_solo: {
      standard: { price: 50000, outfits: 1, edited_soft_copies: 5 },
      super_vip: {
        price: 70000,
        outfits: 1,
        edited_soft_copies: 6,
        extras: ["BTS Video"],
      },
    },
    outdoor_package_solo: {
      standard: { price: 80000, outfits: 1, edited_soft_copies: 5 },
      silver: { price: 160000, outfits: 2, edited_soft_copies: 10 },
      super: { price: 240000, outfits: 3, edited_soft_copies: 15 },
    },
    pre_wedding_studio: {
      basic: { price: 80000, outfits: 1, edited_soft_copies: 7 },
      standard: { price: 160000, outfits: 2, edited_soft_copies: 14 },
      silver: { price: 240000, outfits: 3, edited_soft_copies: 21 },
      super: { price: 320000, outfits: 4, edited_soft_copies: 28 },
    },
    couple_portrait_outdoor: {
      standard: { price: 80000, outfits: 1, edited_soft_copies: 7 },
      silver: { price: 160000, outfits: 2, edited_soft_copies: 14 },
      super: {
        price: 300000,
        outfits: 3,
        edited_soft_copies: 21,
        extras: ["Backdrop"],
      },
    },
    maternity_outdoor: {
      standard: { price: 100000, outfits: 1, edited_soft_copies: 10 },
      silver: { price: 200000, outfits: 2, edited_soft_copies: 18 },
      super: {
        price: 400000,
        outfits: 3,
        edited_soft_copies: 27,
        extras: ["Enlargement", "Backdrop"],
      },
    },
    corporate_head_shoot_studio: {
      standard: { price: 70000, outfits: 1, edited_soft_copies: 5 },
      super_vip: {
        price: 180000,
        outfits: 2,
        edited_soft_copies: 10,
        extras: ["BTS Video"],
      },
    },
    family_and_friends_outdoor: {
      basic: {
        price: 120000,
        outfits: 1,
        edited_soft_copies: 10,
        extras: ["Backdrop"],
      },
      standard: {
        price: 240000,
        outfits: 2,
        edited_soft_copies: 20,
        extras: ["Backdrop"],
      },
      super: {
        price: 360000,
        outfits: 3,
        edited_soft_copies: 25,
        extras: ["Backdrop", "Photobook"],
      },
      ultra: {
        price: 480000,
        outfits: 4,
        edited_soft_copies: 30,
        extras: ["Backdrop", "Photobook"],
      },
      ultra_plus: {
        price: 600000,
        outfits: 5,
        edited_soft_copies: 35,
        extras: ["Backdrop", "Photobook", "Enlargement"],
      },
    },
    convocation_graduation: {
      single: { price: 40000, photos: "5 HD Images", type: "Per Session" },
      group: {
        price: 60000,
        rule: "Per person, Max 5 persons",
        photos: "3 Individual + 3 Group (6 total HD Images)",
      },
      family_group: {
        price: 80000,
        rule: "Family of 2-4",
        photos: "7 HD Images",
      },
      extra_image_cost: 10000,
      specific_frames: { "10x12": 30000, "12x16": 40000, "16x20": 50000 },
    },
    call_to_bar: {
      single: { price: 50000, photos: "5 HD Images", type: "Per Session" },
      group: {
        price: 80000,
        rule: "Per person, Max 5 persons",
        photos: "3 Individual + 3 Group (6 total HD Images)",
      },
      family_group: {
        price: 100000,
        rule: "Family of 2-4",
        photos: "7 HD Images",
      },
      extra_image_cost: 10000,
      specific_frames: { "10x12": 30000, "12x16": 40000, "16x20": 50000 },
    },
    weddings_jan_to_sept: {
      platinum: {
        price: 650000,
        deliverables: [
          "Big team",
          "1 Assistant",
          "Bridal session",
          "Extra album",
          "Edited soft copies",
          "Drive of all images",
        ],
      },
      premium_family: {
        price: 850000,
        deliverables: [
          "Big team",
          "Unlimited coverage",
          "1 Photographer + Assistants",
          "Extra large photobook",
          "Edited soft copies",
          "Drive of all images",
          "Online gallery",
          "2 Portraits with backdrop",
        ],
      },
      gold: {
        price: 1200000,
        deliverables: [
          "Alameen team",
          "2 Assistants",
          "Unlimited coverage",
          "In-studio creative sessions",
          "Bridal session",
          "Extra album",
          "2 Extra large frames",
          "Edited soft copies",
          "Drive of all images",
          "Online gallery",
        ],
      },
      add_ons: { backdrop: 100000, album_xl: 100000, album_l: 150000 },
    },
  },
};
