const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

const stripe = require("stripe")(process.env.STRIPE_SK);
const nodemailer = require("nodemailer");

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://stay-vista-1289f.web.app",
    "https://stay-vista-1289f.firebaseapp.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  // console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const sendMail = (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.TRANSPORTER_EMAIL,
      pass: process.env.TRANSPORTER_PASS,
    },
  });
  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  //mail body
  const mailBody = {
    from: `"StayVista" <${process.env.TRANSPORTER_EMAIL}>`,
    to: emailAddress,
    subject: emailData.subject,
    text: "Plaintext version of the message",
    html: emailData.message,
  };

  transporter.sendMail(mailBody, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Sent: " + info.response);
    }
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrdgddr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const roomCollection = client.db("stayVistaDB").collection("rooms");
    const userCollection = client.db("stayVistaDB").collection("users");
    const bookingCollection = client.db("stayVistaDB").collection("bookings");

    // verify admin middleware
    const verifyAdmin = async (req, res, next) => {
      const user = req.user;
      const query = { email: user?.email };
      const result = await userCollection.findOne(query);
      if (!result || result?.role !== "Admin") {
        return res.status(401).send({ message: "unauthorized access!!" });
      }
      next();
    };
    // verify host middleware
    const verifyHost = async (req, res, next) => {
      const user = req.user;
      const query = { email: user?.email };
      const result = await userCollection.findOne(query);
      if (!result || result?.role !== "Host") {
        return res.status(401).send({ message: "unauthorized access!!" });
      }
      next();
    };

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
        console.log("Logout successful");
      } catch (err) {
        res.status(500).send(err);
      }
    });

    //crud operation
    app.get("/rooms", async (req, res) => {
      const category = req.query.category;
      let query = {};
      if (category && category !== "null") query.category = category;
      const result = await roomCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const result = await roomCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/rooms", verifyToken, verifyHost, async (req, res) => {
      const room = req.body;
      const result = await roomCollection.insertOne(room);
      res.send(result);
    });

    app.patch("/rooms/:id", verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const roomInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...roomInfo,
        },
      };
      const result = await roomCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/myListing", verifyToken, verifyHost, async (req, res) => {
      const email = req.query.email;
      const query = { "host.email": email };
      const result = await roomCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/myListing/:id", verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.findOne(query);
      res.send(result);
    });

    app.delete("/rooms/:id", verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      let query = { email: user?.email };
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        if (user.status === "Requested") {
          // check if user already exists in db and try to become host
          const result = await userCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(result);
        } else {
          // if existing user login again
          return res.send("Already Exist in DB");
        }
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await userCollection.updateOne(query, updateDoc, options);
      //welcome email for new users:
      sendMail(user?.email, {
        subject: "Welcome to StayVista",
        message: `Thank You for your interest on StayVista, Hope you will find your Destination. Have A good Time!`,
      });
      res.send(result);
    });

    //get user role
    app.get("/role/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    //get all users for admin to manage them
    app.get("/allUsers", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //update user role
    app.patch(
      "/users/update/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const info = req.body;
        const filter = { email };
        const updateDoc = {
          $set: {
            role: info.role,
            status: info.status,
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    );

    //payment intent

    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const { price } = req.body;
      const priceInSent = parseFloat(price) * 100;
      // console.log(priceInSent)
      // Create a PaymentIntent with the order amount and currency
      const { client_secret } = await stripe.paymentIntents.create({
        amount: priceInSent,
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
      // console.log(client_secret)
      res.send({ clientSecret: client_secret });
    });

    // post booking data to booking collection
    app.post("/booking", async (req, res) => {
      const paymentInfo = req.body;
      const result = await bookingCollection.insertOne(paymentInfo);
      // send email to guest
      sendMail(paymentInfo?.guest?.email, {
        subject: "Booking Successful!",
        message: `You've successfully booked a room through StayVista. Transaction Id: ${paymentInfo.transactionId}`,
      });
      // send email to host
      sendMail(paymentInfo?.host?.email, {
        subject: "Your room got booked!",
        message: `Get ready to welcome ${paymentInfo.guest.name}.`,
      });
      res.send(result);
    });

    //change room status
    app.patch("/room/status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { status } = req.body;
      const updateDoc = {
        $set: {
          booked: status,
        },
      };
      const result = await roomCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //get my bookings
    app.get("/myBookings", verifyToken, async (req, res) => {
      const email = req?.user?.email;
      const query = { "guest.email": email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    //get all booking for managing by admin
    app.get("/allBookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    // cancel reservation
    app.delete("/booking/delete/:id", verifyToken, async (req, res) => {
      const id = req?.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/booking/status/:id", verifyToken, async (req, res) => {
      const id = req.params?.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          booked: false,
        },
      };
      const result = await roomCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //get host stat
    app.get("/hostStat", verifyToken, verifyHost, async (req, res) => {
      const { email } = req.user;
      const bookingDetails = await bookingCollection
        .find({ "host.email": email }, { projection: { date: 1, price: 1 } })
        .toArray();
      const totalSales = bookingDetails.reduce(
        (sum, booking) => sum + booking.price,
        0
      );
      const totalRooms = await roomCollection.countDocuments({
        "host.email": email,
      });
      const totalBookings = bookingDetails.length;
      const { timestamp } = await userCollection.findOne({ email });

      const chartData = bookingDetails.map((booking) => {
        const day = new Date(booking.date).getDate();
        const month = new Date(booking.date).getMonth() + 1;
        const data = [`${day}/${month}`, booking?.price];
        return data;
      });
      chartData.unshift(["Day", "Sales"]);

      res.send({
        totalSales,
        totalRooms,
        totalBookings,
        hostSince: timestamp,
        chartData,
      });
    });

    //get guest stat
    app.get("/guestStat", verifyToken, async (req, res) => {
      const { email } = req?.user;
      const bookingDetails = await bookingCollection
        .find({ "guest.email": email }, { projection: { date: 1, price: 1 } })
        .toArray();
      const totalSpent = bookingDetails.reduce(
        (sum, booking) => sum + booking.price,
        0
      );
      const totalBookings = bookingDetails.length;
      const { timestamp } = await userCollection.findOne({ email });

      const chartData = bookingDetails.map((booking) => {
        const day = new Date(booking.date).getDate();
        const month = new Date(booking.date).getMonth() + 1;
        const data = [`${day}/${month}`, booking?.price];
        return data;
      });
      chartData.unshift(["Day", "Invest"]);

      res.send({ totalSpent, totalBookings, guestSince: timestamp, chartData });
    });

    //admin stat
    app.get("/adminStat", verifyToken, verifyAdmin, async (req, res) => {
      const { email } = req?.user;
      const bookings = await bookingCollection
        .find({}, { projection: { date: 1, price: 1 } })
        .toArray();
      const totalSales = bookings.reduce((sum, acc) => sum + acc.price, 0);
      const totalUser = await userCollection.countDocuments();
      const totalBookings = await bookingCollection.countDocuments();
      const totalRooms = await roomCollection.countDocuments();

      // const data = [
      //   ['Day', 'Sales'],
      //   ['9/5', 1000],
      //   ['10/2', 1170],
      //   ['11/1', 660],
      //   ['12/11', 1030],
      // ]
      const chartData = bookings.map((booking) => {
        const day = new Date(booking.date).getDate();
        const month = new Date(booking.date).getMonth() + 1;
        const data = [`${day}/${month}`, booking?.price];
        return data;
      });
      chartData.unshift(["Day", "Sales"]);

      res.send({ totalSales, totalUser, totalBookings, totalRooms, chartData });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from StayVista Server..");
});

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`);
});
