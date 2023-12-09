const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Party } = require('./partyschema.js');
const ConstituencyData = require('./constituencyDataschema.js');
const MLA = require('./MlaregistrationSchema.js');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

// Define a Mongoose schema for the registration collection
const registrationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String, // Add email field
  MobileNumber: String,
  password: String,
  DOB: Date,
  gender: String,
});


// Create a Mongoose model based on the schema
const Registration = mongoose.model('Registration', registrationSchema);

// Connect to MongoDB
mongoose.connect("mongodb://nodebackend-for-dpapp-server:gWvKSCn8OvkfVvYzgBqtQ4YeaNjfhppkBtLwchLs5kiGZes901NUq8v0KheDNZVJRvci1lhMnIuBACDbixqp1Q==@nodebackend-for-dpapp-server.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@nodebackend-for-dpapp-server@")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle POST request to create a new registration
app.post('/registration', async (req, res) => {
  const { email, MobileNumber } = req.body;

  try {
    // Check if a registration with the given email or MobileNumber already exists
    const existingRegistration = await Registration.findOne({ $or: [{ email }, { MobileNumber }] });

    if (existingRegistration) {
      // Registration with the same email or MobileNumber already exists
      return res.status(400).json({ error: 'Email or MobileNumber already registered' });
    }

    // If no existing registration, create and save the new registration
    const newRegistration = new Registration(req.body);
    const savedRegistration = await newRegistration.save();
    res.json(savedRegistration);
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Retrieve all registrations
app.get('/registrations', async (req, res) => {
  try {
    const allRegistrations = await Registration.find();
    res.json(allRegistrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});
// Delete all registrations
app.delete('/registrations', async (req, res) => {
  try {
    const result = await Registration.deleteMany({});
    res.json({ message: 'All registrations deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete registrations' });
  }
});

// ------------------------------------------------login routes-----------------

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a registration with the given email exists
    const existingRegistration = await Registration.findOne({ email });

    if (!existingRegistration) {
      return res.status(400).json({ error: 'Email not found' });
    }

    // Compare the provided password with the stored password
    if (existingRegistration.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If the email and password are correct, you can provide a token or other authentication response.
    // For simplicity, we'll just send a success message.
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// ----------------------------------------greviances api-----------------------
const { BlobServiceClient } = require("@azure/storage-blob");

const azureStorageConnectionString = "DefaultEndpointsProtocol=https;AccountName=surveyappanswers;AccountKey=/z7TbEOSeMD/CNN/KrNzhpxbqhaiV620aRfLBLRi9nhhiE4AyN9gAG/MywUOzXWpfOqwNctMSFBF+AStE1wa2g==;EndpointSuffix=core.windows.net";

const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);

const containerName = "digitalp-grievance";
const containerClient = blobServiceClient.getContainerClient(containerName);

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Define a Mongoose schema for the Grievance collection
const grievanceSchema = new mongoose.Schema({
  title: String,
  description: String,
  imagePath: String, // Store the path to the uploaded image
  location: String,
  paymentId:String,
  constituencyName:String,
 approvalStatus: {
    type: String,
    default: 'pending', 
  },
  dateOfPosting: { type: Date, default: Date.now }
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

// Create an API endpoint for posting grievances
app.post('/post-grievance', upload.single('image'), async (req, res) => {
  try {
    const { title, description,paymentId,constituencyName,location } = req.body;
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;

    const imageFileName = `${Date.now()}_${req.file.originalname}`; // Use a unique name
    const blockBlobClient = containerClient.getBlockBlobClient(imageFileName);

    await blockBlobClient.uploadData(imageData, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const imagePath = `${containerClient.url}/${imageFileName}`;

    const grievance = new Grievance({ title, description, imagePath,paymentId, constituencyName,location });
    await grievance.save();

    res.status(201).json({ message: 'Grievance posted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update route for changing approvalStatus to "grievance cleared"
app.put('/update-grievance/:grievanceId', async (req, res) => {
  try {
    const grievanceId = req.params.grievanceId;

   
    const updatedGrievance = await Grievance.findOneAndUpdate(
      { _id: grievanceId },
      { $set: { approvalStatus: 'grievance cleared' } },
      { new: true }
    );

    if (!updatedGrievance) {
      return res.status(404).json({ error: 'Grievance not found or already cleared' });
    }

    res.status(200).json({ message: 'Grievance approval status updated to grievance cleared successfully', grievance: updatedGrievance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Create a GET route to fetch all grievances
app.get('/get-grievances', async (req, res) => {
  try {
    const grievances = await Grievance.find();
    res.json(grievances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a DELETE route to delete all grievances
app.delete('/delete-all-grievances', async (req, res) => {
  try {
    const result = await Grievance.deleteMany({});
    res.json({ message: 'All grievances deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a DELETE route to delete a grievance by its ID
app.delete('/delete-grievance/:id', async (req, res) => {
  const grievanceId = req.params.id;

  try {
    const deletedGrievance = await Grievance.findByIdAndDelete(grievanceId);

    if (!deletedGrievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    res.json({ message: 'Grievance deleted successfully', deletedGrievance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -----------------------------------------------------------applauses apis-------------------
// const { BlobServiceClient } = require("@azure/storage-blob");

// const azureStorageConnectionString = "DefaultEndpointsProtocol=https;AccountName=surveyappanswers;AccountKey=/z7TbEOSeMD/CNN/KrNzhpxbqhaiV620aRfLBLRi9nhhiE4AyN9gAG/MywUOzXWpfOqwNctMSFBF+AStE1wa2g==;EndpointSuffix=core.windows.net";

// const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);

const containerName2 = "digitalp-applause";
const containerClient2 = blobServiceClient.getContainerClient(containerName2);




// Define a Mongoose schema for the Grievance collection
const applauseSchema = new mongoose.Schema({
  title: String,
  description: String,
  imagePath: String, // Store the path to the uploaded image
  location: String,
  paymentId:String,
  constituencyName:String,
  dateOfPosting: { type: Date, default: Date.now }
});

const Applause = mongoose.model('Applause', applauseSchema);

// Create an API endpoint for posting applauses
app.post('/post-applause', upload.single('image'), async (req, res) => {
  try {
    const { title, description,paymentId,constituencyName, location } = req.body;
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;

    const imageFileName = `${Date.now()}_${req.file.originalname}`; // Use a unique name
    const blockBlobClient = containerClient2.getBlockBlobClient(imageFileName);

    await blockBlobClient.uploadData(imageData, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const imagePath = `${containerClient2.url}/${imageFileName}`;

    const  applause= new Applause({ title, description, imagePath,paymentId,constituencyName, location });
    await applause.save();

    res.status(201).json({ message: 'applause posted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a GET route to fetch all applauses
app.get('/get-applauses', async (req, res) => {
  try {
    const applauses = await Applause.find();
    res.json(applauses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a DELETE route to delete all applauses
app.delete('/delete-all-applauses', async (req, res) => {
  try {
    const result = await Applause.deleteMany({});
    res.json({ message: 'All applauses deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a DELETE route to delete a applause by its ID
app.delete('/delete-applause/:id', async (req, res) => {
  const applauseId = req.params.id;

  try {
    const deletedApplause = await Applause.findByIdAndDelete(applauseId);

    if (!deletedApplause) {
      return res.status(404).json({ error: 'applause not found' });
    }

    res.json({ message: 'applause deleted successfully', deletedApplause });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------------------Party apis----------------------

const containerName3 = "digitalp-party-symbols";
const containerClient3 = blobServiceClient.getContainerClient(containerName3);



// Create an API endpoint for posting parties

// app.post('/api/party', upload.single('partySymbol'), async (req, res) => {
//   try {
//     const data = req.body;
//     const partySymbolData = req.file.buffer;
//     const contentType = req.file.mimetype;

//     const partySymbolFileName = `${Date.now()}_partySymbol.${contentType.split('/')[1]}`; // Use a unique name
//     const blockBlobClient = containerClient3.getBlockBlobClient(partySymbolFileName);

//     await blockBlobClient.uploadData(partySymbolData, {
//       blobHTTPHeaders: { blobContentType: contentType },
//     });

//     const partySymbolPath = `${containerClient3.url}/${partySymbolFileName}`;

//     // Add the partySymbolPath to the data before saving it to the database
//     data.partySymbol = partySymbolPath;

//     // Check if a party with the same partyCode already exists
//     const existingParty = await Party.findOne({ partyCode: data.partyCode });

//     if (existingParty) {
//       return res.status(400).json({ error: 'Party with entered partyCode already exists' });
//     }

//     // If partyCode is unique, proceed with party creation
//     const newParty = new Party(data);
//     await newParty.save();

//     res.status(201).json({ message: 'Party created successfully', party: newParty });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// Create an API endpoint for posting parties
app.post('/api/party', upload.fields([{ name: 'partySymbol', maxCount: 1 }, { name: 'manifestoFilesinpdf', maxCount: 1 }]), async (req, res) => {
  try {
    const data = req.body;

    // Upload partySymbol file
    const partySymbolData = req.files['partySymbol'][0].buffer;
    const partySymbolContentType = req.files['partySymbol'][0].mimetype;
    const partySymbolFileName = `${Date.now()}_partySymbol.${partySymbolContentType.split('/')[1]}`;
    const partySymbolBlockBlobClient = containerClient3.getBlockBlobClient(partySymbolFileName);
    await partySymbolBlockBlobClient.uploadData(partySymbolData, {
      blobHTTPHeaders: { blobContentType: partySymbolContentType },
    });
    const partySymbolPath = `${containerClient3.url}/${partySymbolFileName}`;
    data.partySymbol = partySymbolPath;

    // Upload manifestoFilesinpdf file
    if (req.files['manifestoFilesinpdf'] && req.files['manifestoFilesinpdf'][0]) {
      const manifestoData = req.files['manifestoFilesinpdf'][0].buffer;
      const manifestoContentType = req.files['manifestoFilesinpdf'][0].mimetype;
      const manifestoFileName = `${Date.now()}_manifestoFilesinpdf.${manifestoContentType.split('/')[1]}`;
      const manifestoBlockBlobClient = containerClient3.getBlockBlobClient(manifestoFileName);
      await manifestoBlockBlobClient.uploadData(manifestoData, {
        blobHTTPHeaders: { blobContentType: manifestoContentType },
      });
      const manifestoPath = `${containerClient3.url}/${manifestoFileName}`;
      data.manifestoFilesinpdf = manifestoPath;
    }

    // Check if a party with the same partyCode already exists
    const existingParty = await Party.findOne({ partyCode: data.partyCode });

    if (existingParty) {
      return res.status(400).json({ error: 'Party with entered partyCode already exists' });
    }

    // If partyCode is unique, proceed with party creation
    const newParty = new Party(data);
    await newParty.save();

    res.status(201).json({ message: 'Party created successfully', party: newParty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assuming you have your Party model and containerClient3 defined

// PUT route for updating the approvalStatus of a party
app.put('/api/party/approve/:partyCode', async (req, res) => {
  try {
    const partyCode = req.params.partyCode;

    const updatedParty = await Party.findOneAndUpdate(
      { partyCode: partyCode },
      { $set: { approvalStatus: 'approved' } },
      { new: true }
    );

    if (!updatedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.status(200).json({ message: 'Party approval status updated successfully', party: updatedParty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all parties
app.get('/api/parties', async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all parties
app.delete('/api/parties', async (req, res) => {
  try {
    await Party.deleteMany();
    res.json({ message: 'All parties deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a party by partyCode
app.delete('/api/party/:partyCode', async (req, res) => {
  const { partyCode } = req.params;
  try {
    const deletedParty = await Party.findOneAndDelete({ partyCode });
    
    if (!deletedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.json({ message: 'Party deleted successfully', deletedParty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// -----------------------------------------------------------constituency data adding & displaying------------
// to post  constituencies
app.post('/constituency', async (req, res) => {
  try {
    // Check if the constituencyName already exists in the database
    const existingConstituency = await ConstituencyData.findOne({
      constituencyName: req.body.constituencyName,
    });

    if (existingConstituency) {
      // If the constituency already exists, send a 409 Conflict response
      return res.status(409).json({ error: 'Constituency already exists' });
    }

    // Create a new ConstituencyData instance based on the request body
    const newConstituency = new ConstituencyData(req.body);

    // Save the new constituency data to the database
    const savedConstituency = await newConstituency.save();

    res.status(201).json(savedConstituency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all constituencies
app.get('/constituencies', async (req, res) => {
  try {
    const allConstituencies = await ConstituencyData.find();
    res.status(200).json(allConstituencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all constituencies
app.delete('/constituencies', async (req, res) => {
  try {
    await ConstituencyData.deleteMany();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific constituency by name
app.delete('/constituency/:constituencyName', async (req, res) => {
  const { constituencyName } = req.params;

  try {
    const deletedConstituency = await ConstituencyData.findOneAndDelete({ constituencyName });

    if (!deletedConstituency) {
      return res.status(404).json({ error: 'Constituency not found' });
    }

    res.status(200).json(deletedConstituency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------MLA Registrations-----------

const containerNameMLA = "digitalp-mla-photos-and-files";
const containerClientMLA = blobServiceClient.getContainerClient(containerNameMLA);

app.post('/api/mlas', upload.fields([
  { name: 'mlaPhoto', maxCount: 1 },
  { name: 'aadharCardPhoto', maxCount: 1 },
  { name: 'electionSymbolPath', maxCount: 1 },
  { name: 'nominationPapersPath', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

    // Upload MLA photo
    const mlaPhotoData = req.files['mlaPhoto'][0].buffer;
    const mlaPhotoContentType = req.files['mlaPhoto'][0].mimetype;
    const mlaPhotoFileName = `${Date.now()}_mlaPhoto.${mlaPhotoContentType.split('/')[1]}`;
    const mlaPhotoBlockBlobClient = containerClientMLA.getBlockBlobClient(mlaPhotoFileName);
    await mlaPhotoBlockBlobClient.uploadData(mlaPhotoData, {
      blobHTTPHeaders: { blobContentType: mlaPhotoContentType },
    });
    const mlaPhotoPath = `${containerClientMLA.url}/${mlaPhotoFileName}`;
    data.mlaPhoto = mlaPhotoPath;

    // Upload Aadhar card photo
    const aadharCardPhotoData = req.files['aadharCardPhoto'][0].buffer;
    const aadharCardPhotoContentType = req.files['aadharCardPhoto'][0].mimetype;
    const aadharCardPhotoFileName = `${Date.now()}_aadharCardPhoto.${aadharCardPhotoContentType.split('/')[1]}`;
    const aadharCardPhotoBlockBlobClient = containerClientMLA.getBlockBlobClient(aadharCardPhotoFileName);
    await aadharCardPhotoBlockBlobClient.uploadData(aadharCardPhotoData, {
      blobHTTPHeaders: { blobContentType: aadharCardPhotoContentType },
    });
    const aadharCardPhotoPath = `${containerClientMLA.url}/${aadharCardPhotoFileName}`;
    data.aadharCardPhoto = aadharCardPhotoPath;

    // Upload election symbol file
    const electionSymbolPathData = req.files['electionSymbolPath'][0].buffer;
    const electionSymbolPathContentType = req.files['electionSymbolPath'][0].mimetype;
    const electionSymbolPathFileName = `${Date.now()}_electionSymbolPath.${electionSymbolPathContentType.split('/')[1]}`;
    const electionSymbolPathBlockBlobClient = containerClientMLA.getBlockBlobClient(electionSymbolPathFileName);
    await electionSymbolPathBlockBlobClient.uploadData(electionSymbolPathData, {
      blobHTTPHeaders: { blobContentType: electionSymbolPathContentType },
    });
    const electionSymbolPathPath = `${containerClientMLA.url}/${electionSymbolPathFileName}`;
    data.electionSymbolPath = electionSymbolPathPath;

    // Upload nomination papers file
    const nominationPapersPathData = req.files['nominationPapersPath'][0].buffer;
    const nominationPapersPathContentType = req.files['nominationPapersPath'][0].mimetype;
    const nominationPapersPathFileName = `${Date.now()}_nominationPapersPath.${nominationPapersPathContentType.split('/')[1]}`;
    const nominationPapersPathBlockBlobClient = containerClientMLA.getBlockBlobClient(nominationPapersPathFileName);
    await nominationPapersPathBlockBlobClient.uploadData(nominationPapersPathData, {
      blobHTTPHeaders: { blobContentType: nominationPapersPathContentType },
    });
    const nominationPapersPathPath = `${containerClientMLA.url}/${nominationPapersPathFileName}`;
    data.nominationPapersPath = nominationPapersPathPath;

    // Check if an MLA with the same Aadhar card number already exists
    const existingMLA = await MLA.findOne({ aadharCardNumber: data.aadharCardNumber });

    if (existingMLA) {
      return res.status(400).json({ error: 'MLA with entered Aadhar number already exists' });
    }

    // If Aadhar card number is unique, proceed with MLA creation
    const newMLA = new MLA(data);
    await newMLA.save();

    res.status(201).json({ message: 'MLA created successfully', mla: newMLA });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/mlas', async (req, res) => {
  try {
    const allMLAs = await MLA.find();
    res.status(200).json(allMLAs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/mlas', async (req, res) => {
  try {
    await MLA.deleteMany({});
    res.status(200).json({ message: 'All MLA data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/mlas/:aadharCardNumber', async (req, res) => {
  const { aadharCardNumber } = req.params;

  try {
    const deletedMLA = await MLA.findOneAndDelete({ aadharCardNumber });

    if (!deletedMLA) {
      return res.status(404).json({ error: 'MLA not found' });
    }

    res.status(200).json({ message: 'MLA deleted successfully', mla: deletedMLA });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/mla/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if an MLA with the given email exists
    const existingMLA = await MLA.findOne({ email });

    if (!existingMLA) {
      return res.status(400).json({ error: 'Email not found' });
    }

      // Compare the provided password with the stored password
    if (existingMLA.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    // If the email and password are correct, you can provide a token or other authentication response.
    // For simplicity, we'll just send a success message.
    res.json({ message: 'Login successful', mla: existingMLA });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello, Digital Parliament world');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
