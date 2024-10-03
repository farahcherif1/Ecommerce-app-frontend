import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { Button, Card, Col, Badge } from 'react-bootstrap';
import { Eye, Pen, Trash, Upload } from 'react-bootstrap-icons';
import ReactStars from "react-rating-stars-component";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isArray } from 'util';
import { getFormatedStringFromDays } from '../../helper/utils';
import { Products } from '../../services/product.service';


interface IProductItemProps {
	userType: string;
	product: Record<string, any>;
}

const ProductItem: FC<IProductItemProps> = ({ userType, product }) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [uploading, setUploading] = React.useState(false);
	const router = useRouter();

	const deleteProduct = async () => {
		try {
			setIsLoading(true);
			const deleteConfirm = confirm(
				'Want to delete? You will lose all details, SKUs, and licenses for this product.'
			);
			if (deleteConfirm) {
				const deleteProductRes = await Products.deleteProduct(product._id);
				if (!deleteProductRes.success) {
					throw new Error(deleteProductRes.message);
				}
				router.push('/products/');
				toast.success(deleteProductRes.message, {
					autoClose: 3000,
				});
			}
		} catch (error: any) {
			if (error.response) {
				if (
					isArray(error.response.data?.message) &&
					Array.isArray(error.response?.data?.message)
				) {
					return error.response.data.message.forEach((message: any) => {
						toast.error(message, { autoClose: 3000 });
					});
				} else {
					return toast.error(error.response.data.message, {
						autoClose: 3000,
					});
				}
			}
			toast.error(error.message, { autoClose: 3000 });
		} finally {
			setIsLoading(false);
		}
	};

	const uploadProductImage = async (e: any) => {
		try {
			setUploading(true);
			const file = e.target.files[0];
			const formData = new FormData();
			formData.append('productImage', file);
			const uploadProductImageRes = await Products.uploadProductImage(
				product._id,
				formData
			);
			if (!uploadProductImageRes.success) {
				throw new Error(uploadProductImageRes.message);
			}
			product.image = uploadProductImageRes.result;
			toast.success(uploadProductImageRes.message, {
				autoClose: 3000,
			});
		} catch (error: any) {
			if (error.response) {
				if (
					isArray(error.response.data?.message) &&
					Array.isArray(error.response?.data?.message)
				) {
					return error.response.data.message.forEach((message: any) => {
						toast.error(message, { autoClose: 3000 });
					});
				}
				return toast.error(error.response.data.message, {
					autoClose: 3000,
				});
			}
			toast.error(error.message, { autoClose: 3000 });
		} finally {
			setUploading(false);
		}
	};

	return (
		<Col>
			<Card className='productCard'>
				<Card.Img
					onClick={() => router.push(`/products/${product?._id}`)}
					variant='top'
					src={
						uploading
							? 'https://www.ebi.ac.uk/training/progressbar.gif'
							: product?.image
					}
				/>
				<Card.Body>
					<Card.Title onClick={() => router.push(`/products/${product?._id}`)}>
						{product.productName}
					</Card.Title>
					<ReactStars
						count={5}
						value={product?.avgRating || 0}
						edit={false}
						size={24}
						activeColor="#ffd700"
					/>

					<Card.Text>
						<span className='priceText'>
							<span className='priceText'>
								{product?.skuDetails
									? product?.skuDetails?.length > 1
										? `₹${Math.min.apply(
												Math,
												product?.skuDetails.map(
													(sku: { price: number }) => sku.price
												)
										  )} - ₹${Math.max.apply(
												Math,
												product?.skuDetails.map(
													(sku: { price: number }) => sku.price
												)
										  )}`
										: `₹${product?.skuDetails?.[0]?.price || '000'}`
									: '₹000'}{' '}
							</span>
						</span>
					</Card.Text>
					{product?.skuDetails &&
						product?.skuDetails?.length > 0 &&
						product?.skuDetails
							.sort(
								(a: { validity: number }, b: { validity: number }) =>
									a.validity - b.validity
							)
							.map((sku: Record<string, any>, key: any) => (
								<Badge bg='warning' text='dark' className='skuBtn' key={key}>
									{sku.lifetime
										? 'Lifetime'
										: getFormatedStringFromDays(sku.validity)}
								</Badge>
							))}
					<br />
					{userType === 'admin' ? (
						<div className='btnGrpForProduct'>
							<div className='file btn btn-md btn-outline-primary fileInputDiv'>
								<Upload />
								<input
									type='file'
									name='file'
									className='fileInput'
									onChange={uploadProductImage}
								/>
							</div>
							<Link href={`/products/update-product?productId=${product?._id}`} className='btn btn-outline-dark viewProdBtn'>
								<Pen />
							</Link>

							<Button
								variant='outline-dark'
								className='btn btn-outline-dark viewProdBtn'
								onClick={() => deleteProduct()}
							>
								{isLoading && (
									<span
										className='spinner-border spinner-border-sm mr-2'
										role='status'
										aria-hidden='true'
									></span>
								)}
								<Trash />
							</Button>
							<Link href={`/products/${product?._id}`} className='btn btn-outline-dark viewProdBtn'>
								
									<Eye />
								
							</Link>
						</div>
					) : (
						<Link href={`/products/${product?._id}`} className='btn btn-outline-dark viewProdBtn'>
							
								<Eye />
								View Details
						
						</Link>
					)}
				</Card.Body>
			</Card>
		</Col>
	);
};

export default ProductItem;
