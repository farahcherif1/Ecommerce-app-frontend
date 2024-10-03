import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useContext } from 'react';
import { Badge } from 'react-bootstrap';
import { Button, Card, CloseButton, Image, Offcanvas } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // import toastify CSS
import { Context } from '../context';
import { getFormatedStringFromDays } from '../helper/utils';
import { Orders } from '../services/order.service';
import CartItems from './CartItems';

interface IProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

const CartOffCanvas: FC<IProps> = ({ show, setShow }: IProps) => {
  const handleClose = () => setShow(false);
  const router = useRouter();
  const { cartItems, cartDispatch } = useContext(Context);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      if (cartItems.length > 0) {
        const sessionRes = await Orders.checkoutSession(cartItems);
        if (!sessionRes.success) {
          throw new Error(sessionRes.message);
        }
        router.push(sessionRes.result);
      }
    } catch (error: any) {
      if (error.response && Array.isArray(error.response?.data?.message)) {
        error.response.data.message.forEach((message: any) => {
          toast.error(message, { autoClose: 3000 });
        });
      } else {
        toast.error('Something went wrong. Please try again!', { autoClose: 3000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast container to show notifications */}
      <ToastContainer />
      
      <Offcanvas show={show} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <CartItems />
          <Button
            variant='primary'
            style={{ width: '100%' }}
            disabled={isLoading}
            onClick={handleCheckout}
          >
            {isLoading && (
              <span
                className='spinner-border spinner-border-sm mr-2'
                role='status'
                aria-hidden='true'
              ></span>
            )}
            Checkout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CartOffCanvas;
