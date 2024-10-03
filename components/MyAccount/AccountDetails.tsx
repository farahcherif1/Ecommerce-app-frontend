import React, { FC } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { resposnePayload } from '../../services/api';
import { Users } from '../../services/user.service';
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles

interface IAccountDetailsProps {
  user: Record<string, any>;
  dispatch: any;
}

const AccountDetails: FC<IAccountDetailsProps>=({ user, dispatch }) => {
  const [accountForm, setAccountForm] = React.useState({
    name: user?.name,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const updateUserAccount = async (e: any) => {
    e.preventDefault();
    try {
      const { name, oldPassword, newPassword, confirmPassword } = accountForm;

      if (!newPassword || !confirmPassword || !oldPassword) {
        throw new Error('Invalid password');
      }

      if (newPassword && newPassword.length < 6) {
        throw new Error('Password is too short. Minimum 6 characters');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      setIsLoading(true);
      const payload = {
        name,
        oldPassword,
        newPassword,
      };

      const { success, message, result }: resposnePayload = await Users.updateUser(payload, user.id);
      if (!success) throw new Error(message);

      dispatch({
        type: 'UPDATE_USER',
        payload: result,
      });

      setAccountForm({
        name: result.name,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success(message, { autoClose: 3000 });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mt-3'>
      <Card.Header>Account Details</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className='mb-3' controlId='formFullName'>
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter your full name'
              value={accountForm.name}
              onChange={(e) =>
                setAccountForm({ ...accountForm, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formEmail'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='name@example.com'
              disabled
              value={user?.email}
            />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formOldPassword'>
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter your current password'
              value={accountForm.oldPassword}
              onChange={(e) =>
                setAccountForm({ ...accountForm, oldPassword: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formNewPassword'>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter your new password'
              value={accountForm.newPassword}
              onChange={(e) =>
                setAccountForm({ ...accountForm, newPassword: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formConfirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Re-type your new password'
              value={accountForm.confirmPassword}
              onChange={(e) =>
                setAccountForm({
                  ...accountForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Button
              variant='info'
              type='submit'
              className='btnAuth'
              onClick={updateUserAccount}
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className='spinner-border spinner-border-sm'
                  role='status'
                  aria-hidden='true'
                ></span>
              )}
              Update
            </Button>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AccountDetails;
