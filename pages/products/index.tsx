import styles from '../../styles/Product.module.css';
import { GetServerSideProps } from 'next';
import type { NextPage } from 'next';
import queryString from 'query-string';
import { Col, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import BreadcrumbDisplay from '../../components/shared/BreadcrumbDisplay';
import PaginationDisplay from '../../components/shared/PaginationDisplay';
import { PlusCircle } from 'react-bootstrap-icons';
import { useContext, useEffect, useState } from 'react';
import ProductItem from '../../components/Products/ProductItem';
import ProductFilter from '../../components/Products/ProductFilter';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from '../../context';

interface Props {
	products: Record<string, any>[];
	metadata: Record<string, any>;
}

const AllProducts: NextPage<Props> = ({ products, metadata }) => {
	const [userType, setUserType] = useState('customer');
	const [sortText, setSortText] = useState('Sort by');
	const router = useRouter();

	const {
		state: { user },
		dispatch,
	} = useContext(Context);

	useEffect(() => {
		if (user && user.email) {
			setUserType(user.type);
		}
	}, [user]);

	// Notification function
	const notifyError = (message: string) => {
		toast.error(message, {
			position: 'top-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
	};

	return (
		<>
			<ToastContainer />
			<Row>
				<Col md={8}>
					<BreadcrumbDisplay
						childrens={[
							{ active: false, href: '/', text: 'Home' },
							{ active: true, href: '', text: 'Products' },
						]}
					/>
				</Col>
				<Col md={4}>
					<DropdownButton
						variant='outline-secondary'
						title={sortText}
						id='input-group-dropdown-2'
						className={styles.dropdownBtn}
						onSelect={(e) => {
							if (e) {
								setSortText(
									e === '-avgRating' ? 'Rating' : e === '-createdAt' ? 'Latest' : 'Sort By'
								);
								delete router.query.offset;
								router.query.sort = e;
								router.push(router);
							} else {
								delete router.query.sort;
								router.push(router);
							}
						}}
					>
						<Dropdown.Item href='#' eventKey='-avgRating'>Rating</Dropdown.Item>
						<Dropdown.Item href='#' eventKey='-createdAt'>Latest</Dropdown.Item>
						<Dropdown.Item href='#' eventKey=''>Reset</Dropdown.Item>
					</DropdownButton>
					{userType === 'admin' && (
						<Link href='/products/update-product'  className='btn btn-primary btnAddProduct'>
							
								<PlusCircle className='btnAddProductIcon' /> Add Product
							
						</Link>
					)}
				</Col>
			</Row>
			<Row>
				<Col sm={2}>
					<ProductFilter />
				</Col>
				<Col sm={10}>
					<Row xs={1} md={3} className='g-3'>
						{products && products.length > 0 ? (
							products.map((product: Record<string, any>) => (
								<ProductItem key={product._id as string} userType={userType} product={product} />
							))
						) : (
							<h1>No Products</h1>
						)}
					</Row>
				</Col>
			</Row>
			<Row>
				<Col>
					<PaginationDisplay metadata={metadata} />
				</Col>
			</Row>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<Props> = async (context): Promise<any> => {
	try {
		// Get products with axios
		const url = queryString.stringifyUrl({
			url: `${
				process.env.NODE_ENV !== 'production'
					? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
					: process.env.NEXT_PUBLIC_BASE_API_URL
			}/products`,
			query: context.query,
		});
		const { data } = await axios.get(url);
		return {
			props: {
				products: data?.result?.products || ([] as Record<string, any>[]),
				metadata: data?.result?.metadata || {},
			},
		};
	} catch (error) {
		console.error('Error fetching products:', error);
		// Trigger toast notification if the request fails
		toast.error('Failed to fetch products. Please try again later.');
		return {
			props: {
				products: [],
				metadata: {},
			},
		};
	}
};

export default AllProducts;
