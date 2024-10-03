import React, { FC, useState } from 'react';
import { Badge, Button, Table } from 'react-bootstrap';
import { Archive, Eye, Pen } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { getFormatedStringFromDays } from '../../helper/utils';
import { Products } from '../../services/product.service';
import SkuDetailsForm from './SkuDetailsForm';
import SkuDetailsLicense from './SkuDetailsLicense';

interface ISkuDetailsListProps {
	skuDetails: any;
	productId: string;
	setAllSkuDetails: any;
}

const SkuDetailsList: FC<ISkuDetailsListProps> = ({
	skuDetails: allSkuDetails,
	productId,
	setAllSkuDetails,
}) => {
	const [skuDetailsFormShow, setSkuDetailsFormShow] = useState(false);
	const [skuIdForUpdate, setSkuIdForUpdate] = useState('');
	const [licensesListFor, setLicensesListFor] = useState('');
	const [isLoadingForDelete, setIsLoadingForDelete] = useState({
		status: false,
		id: '',
	});

	const deleteHandler = async (skuId: string) => {
		try {
			const deleteConfirm = confirm(
				'Want to delete? You will lose all licenses for this SKU.'
			);
			if (deleteConfirm) {
				setIsLoadingForDelete({ status: true, id: skuId });
				const deleteSkuRes = await Products.deleteSku(productId, skuId);
				if (!deleteSkuRes.success) {
					throw new Error(deleteSkuRes.message);
				}
				setAllSkuDetails(
					allSkuDetails.filter((sku: { _id: string }) => sku._id !== skuId)
				);
				toast.success(deleteSkuRes.message, {
					autoClose: 3000,
				});
			}
		} catch (error: any) {
			if (error.response) {
				const errorMessage = Array.isArray(error.response?.data?.message)
					? error.response.data.message.join(', ')
					: error.response.data.message;
				toast.error(errorMessage, { autoClose: 5000 });
			} else {
				toast.error(error.message, { autoClose: 5000 });
			}
		} finally {
			setIsLoadingForDelete({ status: false, id: '' });
		}
	};

	return (
		<>
			<ToastContainer /> {/* Add ToastContainer to render notifications */}

			{!skuDetailsFormShow && !licensesListFor && (
				<>
					<Button variant='secondary' onClick={() => setSkuDetailsFormShow(true)}>
						Add SKU Details
					</Button>
					<Table responsive>
						<thead>
							<tr>
								<th>Name</th>
								<th>Price</th>
								<th>License Keys</th>
								<th>Actions</th>
							</tr>
						</thead>

						<tbody>
							{allSkuDetails && allSkuDetails.length > 0 ? (
								allSkuDetails.map((skuDetail: any, key: any) => (
									<tr key={key}>
										<td>{skuDetail?.skuName}</td>
										<td>
											₹{skuDetail?.price}{' '}
											<Badge bg='warning' text='dark'>
												{skuDetail?.lifetime
													? 'Lifetime'
													: getFormatedStringFromDays(skuDetail?.validity)}
											</Badge>
										</td>
										<td>
											<Button
												variant='link'
												onClick={() => {
													setLicensesListFor(skuDetail?._id);
													setSkuDetailsFormShow(false);
												}}
											>
												View
											</Button>
										</td>
										<td>
											<Button
												variant='outline-dark'
												id={skuDetail._id}
												onClick={() => {
													setSkuIdForUpdate(skuDetail._id);
													setSkuDetailsFormShow(true);
												}}
											>
												<Pen />
											</Button>{' '}
											<Button
												variant='outline-dark'
												onClick={() => deleteHandler(skuDetail._id)}
											>
												{isLoadingForDelete.status &&
												isLoadingForDelete.id === skuDetail._id ? (
													<span
														className='spinner-border spinner-border-sm'
														role='status'
														aria-hidden='true'
													></span>
												) : (
													<Archive />
												)}
											</Button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5}>No SKU Details found</td>
								</tr>
							)}
						</tbody>
					</Table>
				</>
			)}

			{skuDetailsFormShow && (
				<SkuDetailsForm
					setSkuDetailsFormShow={setSkuDetailsFormShow}
					setAllSkuDetails={setAllSkuDetails}
					allSkuDetails={allSkuDetails}
					productId={productId}
					skuIdForUpdate={skuIdForUpdate}
					setSkuIdForUpdate={setSkuIdForUpdate}
				/>
			)}

			{licensesListFor && (
				<SkuDetailsLicense
					licensesListFor={licensesListFor}
					setLicensesListFor={setLicensesListFor}
					productId={productId}
				/>
			)}
		</>
	);
};

export default SkuDetailsList;
