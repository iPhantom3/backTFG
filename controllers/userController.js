import asyncHandler from '../middlewares/asyncHandler.js';
import Users from '../models/userModel.js';
import Discounts from '../models/discountModel.js';

import generateAfilliateCode from '../utils/generateAfilliateCode.js';
import generateToken from '../utils/generateToken.js';
import generateCode from '../utils/generateCode.js';
import sendMail from '../utils/nodemailer.js';

// @desc    Auth user & get token
// @route   POST /api/users/signin
// @access  Public
const signInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const formattedEmail = email.trim().toLowerCase();

  try {
    const user = await Users.findOne({ email: formattedEmail });

    if (user && (await user.comparePassword(password))) {
      generateToken(res, user._id);

      res.status(200).json({ user });
    } else {
      res.status(401).json({ message: 'Credenciales erroneas' });
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Register user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    dni, 
    category, 
    friendCode, 
    termsAccepted,
    privacyAccepted,
    profileImageUrl
  } = req.body;

  const formattedEmail = email.trim().toLowerCase();
  const formattedName = name.trim();

  try {
    const userExists = await Users.findOne({ email: formattedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const affiliateCode = generateAfilliateCode();

    const user = await Users.create({
      name: formattedName,
      email: formattedEmail,
      password,
      dni: dni.toUpperCase(),
      category: category,
      affiliateCode,
      friendCode,
      termsAccepted,
      privacyAccepted,
      profileImageUrl
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({ user });
    } else {
      res.status(400).json({ message: 'Datos de usuario erroneos.' });
      throw new Error('Datos de usuario erroneos');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Logout user / clear cookies
// @route   POST /api/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Cierre de sesión completado.' });
});


// @desc    Check user exists & send resetToken
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  try {
    const existingUser = await Users.findOne({ email: lowerCaseEmail });

    if (existingUser){

      const token = generateCode()

      existingUser.resetToken = token
      existingUser.resetTokenExpiration = Date.now() + 3600000;
      await existingUser.save();

      await sendMail(existingUser.email, `Hola desde EuroTaller. \n\nEste es su código de verificacion para restablecer su contraseña: ${token}.\nEste código estará activo solamente 1 hora.\n\nSi no ha solicitado el restablecimiento de contraseña, ignore este mensaje.\n\nMuchas gracias,\nUn saludo.`);

      res.status(200).json({ message: 'Email enviado' });
    } else {
      res.status(401).json({ message: 'Credenciales erroneas' });
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Reset user password
// @route   POST /api/users/resetpassword
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { 
    email,
    newPassword,
    verificationCode
   } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  try {
    const existingUser = await Users.findOne({ email: lowerCaseEmail });

    if (existingUser){
      
      if(existingUser.resetToken !== verificationCode){
        return res.status(400).json({ message: 'Credenciales erroneas' })
      }
      if(existingUser.resetTokenExpiration < new Date()) {
        return res.status(400).json({ message: 'Credenciales erroneas' })
      }

      existingUser.password = newPassword;
      existingUser.resetToken = '';
      existingUser.resetTokenExpiration = null;
      await existingUser.save();
      res.status(200).json({ message: 'Contraseña restablecida' });
    } else {
      res.status(401).json({ message: 'Credenciales erroneas' });
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.log(error);
  }
});


// @desc    Get a user
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await Users.findById(req.user._id).select(
      '_id name email dni category profileImageUrl'
    );

    if (user) {
      res.send(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
      throw new Error('User not found');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Get a list of users
// @route   GET /api/users/userlist
// @access  Private/Profesional
const getUsersList = asyncHandler(async (req, res) => {
  try {
    const users = await Users.find({isProfessional: false}).select('name dni _id');

    const usersList = [];

    for (let user of users) {
      const userItem = {
        user: `${user.name} - ${user.dni}`,
        userId: `${user._id}`,
      };

      usersList.push(userItem);
    }

    if (users) {
      res.status(200).send(usersList);
    } else {
      res.status(404).json({ message: 'Usuarios no encontrado' });
      throw new Error('Users not found');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Update a user
// @route   PUT /api/users/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await Users.findById(req.user._id);

    if (user) {

      if (req.body.name) {
        user.name = req.body.name;
      }

      if (req.body.category) {
        user.category = req.body.category;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      if(req.body.profileImageUrl){
        user.profileImageUrl = req.body.profileImageUrl
      }

      const updatedUser = await user.save();
      if(updatedUser){
        res.status(200).json({message: 'Usuario editado'});
      } else {
        res.status(500).json({ message: 'Error en el servidor' });
      }
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
      throw new Error('User not found');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Get user invitation info
// @route   GET /api/users/invitation
// @access  Private
const getUserInvitations = asyncHandler( async (req, res) => {
    try {
      const user = await Users.findById({_id: req.user._id})
        .select('affiliateCode affiliates')
      const discounts = await Discounts.find({isActive: true})
        .select('-createdAt -updateAt');

      let data;
      
      if(discounts.length > 0) {
        const sortedDiscounts = discounts.sort((a, b) => b.accounts - a.accounts);

        data = {
          'limit': sortedDiscounts[sortedDiscounts.length - 1 ].accounts,
          'percent': '0%',
          'affiliates': user.affiliates,
          'affiliateCode': user.affiliateCode
        }
        for(let i = 0; i < sortedDiscounts.length - 1; i++){
          if( i === 0 && user.affiliates >= sortedDiscounts[i].accounts ){
            data.limit = sortedDiscounts[i].accounts;
            data.percent = sortedDiscounts[i].percent;
            break;
          } else if(user.affiliates >= sortedDiscounts[i].accounts
            && user.affiliates < sortedDiscounts[i - 1].accounts){
              data.limit = sortedDiscounts[i - 1].accounts;
              data.percent = sortedDiscounts[i].percent;
              break
          }
        } 
      } else {
        data = {
          'noDiscount': true,
          'affiliateCode': user.affiliateCode
        }
      }
      
      res.status(200).json(data);

    } catch (error) {
      console.log(error);
    }
});



export {
  signInUser,
  registerUser,
  logoutUser,
  getProfile,
  getUsersList,
  updateUser,
  getUserInvitations,
  forgotPassword,
  resetPassword
};
