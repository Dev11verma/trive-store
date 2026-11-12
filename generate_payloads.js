const payloads = [
  {
    order_number: "TRIVE-SANDBOX-01",
    shipping_address: {
      first_name: "Dev",
      last_name: "Verma",
      address1: "House No. 4, Balaji Dham 3, Neelbad",
      city: "Bhopal",
      province: "Madhya Pradesh",
      zip: "462044",
      country_code: "IN",
      phone: "9977798829",
      email: "support@trive.in"
    },
    line_items: [
      { sku: "MRnHs-Bk-L", quantity: 1, price: "999" }
    ],
    gateway: "COD",
    qikink_shipping: "1"
  },
  {
    order_number: "TRIVE-SANDBOX-02",
    shipping_address: {
      first_name: "Dev",
      last_name: "Verma",
      address1: "House No. 4, Balaji Dham 3, Neelbad",
      city: "Bhopal",
      province: "Madhya Pradesh",
      zip: "462044",
      country_code: "IN",
      phone: "9977798829",
      email: "support@trive.in"
    },
    line_items: [
      { sku: "MVnHs-Bk-M", quantity: 1, price: "999" }
    ],
    gateway: "COD",
    qikink_shipping: "1"
  },
  {
    order_number: "TRIVE-SANDBOX-03",
    shipping_address: {
      first_name: "Dev",
      last_name: "Verma",
      address1: "House No. 4, Balaji Dham 3, Neelbad",
      city: "Bhopal",
      province: "Madhya Pradesh",
      zip: "462044",
      country_code: "IN",
      phone: "9977798829",
      email: "support@trive.in"
    },
    line_items: [
      { sku: "MRnHs-Nb-S", quantity: 1, price: "999" }
    ],
    gateway: "COD",
    qikink_shipping: "1"
  }
];

console.log(JSON.stringify(payloads, null, 2));
