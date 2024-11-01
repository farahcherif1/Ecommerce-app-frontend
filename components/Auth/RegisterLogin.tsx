import React, { FC, useContext, useEffect, useRef } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Users } from '../../services/user.service';
import { resposnePayload } from '../../services/api';
import validator from 'validator';
import Router from 'next/router';
import { Context } from '../../context'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IRegisterLoginProps {
	isResgisterForm?: boolean;
}

const initalForm = {
	email: '',
	password: '',
	confirmPassword: '',
	name: '',
};


const RegisterLogin: FC<IRegisterLoginProps> = ({
	isResgisterForm = false,}) => { 

	const [authForm, setAuthForm] = React.useState(initalForm);
	const [isLoading, setIsLoading] = React.useState(false);
	const [isLoadingForgotPwd, setIsLoadingForgotPwd] = React.useState(false);
	const [otpTime, setOtpTime] = React.useState(false);
	const [otpForm, setOtpForm] = React.useState({ email: '', otp: '' });
        
	const {
		state: { user },
		dispatch,
	} = useContext(Context);

	useEffect(() => {
		if (user && user.email) {
			Router.push('/my-account'); // if user already logged in redirect to my account
		}
	}, [user]);

    // handle register form
	const handleRegister = async (e: any) => {
		e.preventDefault();
		try {
			const { email, name, password, confirmPassword } = authForm;
			if (!name) {
				throw new Error('Invalid name');
			}
			if (!validator.isEmail(email)) {
				throw new Error('Invalid email');
			}
			if (password !== confirmPassword) {
				console.error('Invalid password', password, confirmPassword);
				throw new Error('Password does not match');
			}
			if (password.length < 6) {
				throw new Error('Password is too short. Minimum 6 characters');
			}
			setIsLoading(true);
			const payload = {
				email: authForm.email,
				password: authForm.password,
				name: authForm.name,
			};

			const { success, message }: resposnePayload = await Users.registerNewUser(
				payload
			);
			if (!success) throw new Error(message);
			setOtpForm({ ...otpForm, email: email });
			setOtpTime(true);
			return toast.success(message, { autoClose: 3000 });

		} catch (error: any) {
			if (error.response) {
                return toast.error(error.response.data.message, { autoClose: 3000 });

			}
			toast.error(error.message, { autoClose: 3000 });
		} finally {
			setIsLoading(false);
		}
	};


// handle login
const handleLogin = async (e: any) => {
  e.preventDefault();
  try {
    const { email, password } = authForm;
    if (!email || !password) {
      throw new Error('Invalid email or password');
    }
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email');
    }
    if (password.length < 6) {
      throw new Error('Password is too short. Minimum 6 characters');
    }
    setIsLoading(true);
    const payload = {
      email,
      password,
    };
    const { success, message, result }: resposnePayload = await Users.loginUser(payload);
    if (!success) throw new Error(message);

    dispatch({
      type: 'LOGIN',
      payload: result?.user,
    });
    
    toast.success(message, { autoClose: 3000 });
    
    // redirect to home page
    Router.push('/');
  } catch (error: any) {
    console.log(error);
    if (error.response) {
      return toast.error(error.response.data.message, { autoClose: 3000 });
    }
    toast.error(error.message, { autoClose: 3000 });
  } finally {
    setIsLoading(false);
  }
};




// handle resend otp
const otpResend = async () => {
  try {
    const { email } = otpForm;
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email');
    }
    setIsLoading(true);
    const { success, message }: resposnePayload = await Users.resendOTP(email);
    if (!success) throw new Error(message);
    toast.success(message, { autoClose: 3000 });
  } catch (error: any) {
    if (error.response) {
      return toast.error(error.response.data.message, { autoClose: 3000 });
    }
    toast.error(error.message, { autoClose: 3000 });
  } finally {
    setIsLoading(false);
  }
};

	// verify user otp
	const verifyUser = async (e: any) => {
		e.preventDefault();
		try {
		  if (!validator.isEmail(otpForm.email)) {
			throw new Error('Invalid email');
		  }
		  setIsLoading(true);
		  const { success, message }: resposnePayload = await Users.verifyOTP(
			otpForm.otp,
			otpForm.email
		  );
		  if (!success) throw new Error(message);
		  toast.success(message, { autoClose: 3000 });
		  setOtpTime(false);
		  setAuthForm(initalForm);
		} catch (error: any) {
		  if (error.response) {
			return toast.error(error.response.data.message, { autoClose: 3000 });
		  }
		  toast.error(error.message, { autoClose: 3000 });
		} finally {
		  setIsLoading(false);
		}
	  };


    return (
		<Card>
			<Card.Header>{isResgisterForm ? 'Register' : 'Login'}</Card.Header>
			<Card.Body>
				<Form>
			
					{isResgisterForm && (
						<Form.Group className='mb-3'>
							<Form.Label>Full name</Form.Label>
							<Form.Control
								type='text'
								name='name'
								placeholder='Enter your full name'
								disabled={otpTime}
								value={authForm.name || ''}
								onChange={(e) =>
									setAuthForm({ ...authForm, name: e.target.value })
								}
							/>
						</Form.Group>
					)}
					<Form.Group className='mb-3'>
						<Form.Label>Email address</Form.Label>
						<Form.Control
							type='email'
							name='email'
							placeholder='Enter email'
							disabled={otpTime}
							value={authForm.email || ''}
							onChange={(e) =>
								setAuthForm({ ...authForm, email: e.target.value })
							}
						/>
					</Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type='password'
                            name='password'
                            placeholder='Password'
                            disabled={otpTime}
                            value={authForm.password || ''}
                            onChange={(e) =>
                                setAuthForm({ ...authForm, password: e.target.value })
                            }
                        />
                    </Form.Group>
                    {isResgisterForm && (
                        <Form.Group className='mb-3'>
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type='password'
                                name='confirmPassword'
                                placeholder='Confirm Password'
                                disabled={otpTime}
                                value={authForm.confirmPassword || ''}
                                onChange={(e) =>
                                    setAuthForm({
                                        ...authForm,
                                        confirmPassword: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                    )}

                    {otpTime && (
                        <Form.Group className='mb-3'>
                            <Form.Label>OTP</Form.Label>
                            <Form.Control
                                type='text'
                                name='otp'
                                placeholder='Enter OTP'
                                onChange={(e) =>
                                    setOtpForm({ ...otpForm, otp: e.target.value })
                                }
                            />

                            <Button
                                variant='link'
                                className='resendOtpBtn'
                                onClick={otpResend}
                            >
                                Resend OTP
                            </Button>
                        </Form.Group>
                    )}
                    

					{otpTime ? (
						<Form.Group className='mb-3'>
							<Button
								variant='info'
								type='submit'
								className='btnAuth'
								disabled={isLoading}
								onClick={verifyUser}
							>
								{isLoading && (
									<span
										className='spinner-border spinner-border-sm mr-2'
										role='status'
										aria-hidden='true'
									></span>
								)} 
								Submit
							</Button>
						</Form.Group>
					) : (
						<Form.Group className='mb-3'>
							<Button
								variant='info'
								type='submit'
								className='btnAuth'
								disabled={isLoading}
								onClick={isResgisterForm ? handleRegister : handleLogin}
							>
								 {isLoading && (
									<span
										className='spinner-border spinner-border-sm mr-2'
										role='status'
										aria-hidden='true'
									></span>
								)} 
								{isResgisterForm ? 'Register' : 'Login'}
							</Button>
						</Form.Group>
					)}
				</Form>
                    {!isResgisterForm && (
					<a
						style={{ textDecoration: 'none' }}
						href='/forgot-password'
						// onClick={forgotPassword}
					>
						{/* {isLoadingForgotPwd && (
							<span
								className='spinner-border spinner-border-sm'
								role='status'
								aria-hidden='true'
							></span>
						)} */}
						Forgot your password?
					</a>
				)}
                        


			</Card.Body>
		</Card>
  )
}

export default RegisterLogin