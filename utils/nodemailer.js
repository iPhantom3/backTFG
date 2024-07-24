import nodemailer from 'nodemailer';

const sendMail = async (userEmail, message) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: 'eurotalleremail@gmail.com',
    to: userEmail,
    subject: 'Restablecer contraseña EuroTaller',
    text: message
  };

  transport.sendMail(mailOptions, (error, info) => {
    if(error){
      console.log('Error sendMail: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  })
};

export default sendMail;

