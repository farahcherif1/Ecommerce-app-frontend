import Footer from '../components/shared/Footer';
import Heading from '../components/shared/Heading';
import TopHead from '../components/shared/TopHead';
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';


import { AppProps } from 'next/app';
import { Provider } from '../context';
import { Container } from 'react-bootstrap';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider>
      <Heading />
      <Container>
      <ToastContainer />
      <TopHead />
      <Component {...pageProps} />
      <Footer />

      </Container>
      </Provider>

    </>
  );
}

export default MyApp
