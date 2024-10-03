import React, { FC, useContext } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { ArrowClockwise, PersonFill } from 'react-bootstrap-icons';
import ReactStars from 'react-rating-stars-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import CSS for Toastify
import { Context } from '../../context';
import { Products } from '../../services/product.service';

interface IProps {
	reviews: Record<string, any>[];
	productId: string;
}

const intialState = {
	rating: 0,
	review: '',
};

const ReviewSection: FC<IProps> = ({ reviews, productId }) => {
	const [filteredReviews, setFilteredReviews] = React.useState(reviews);
	const [allReviews, setAllReviews] = React.useState(reviews);
	const [isLoading, setIsLoading] = React.useState(false);
	const [reviewForm, setReviewFrom] = React.useState(intialState);
	const [filterValue, setFilterValue] = React.useState(0);
	const [formShown, setFormShown] = React.useState(false);
	const {
		state: { user },
	} = useContext(Context);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		try {
			setIsLoading(true);
			const { rating, review } = reviewForm;
			if (!review || !rating) {
				toast.error('Invalid data');
				return false;
			}

			const newReviewResponse = await Products.addReview(productId, reviewForm);
			if (newReviewResponse.success) {
				toast.success(newReviewResponse.message);
			}
			setAllReviews(newReviewResponse.result.feedbackDetails);
			setFilteredReviews(newReviewResponse.result.feedbackDetails);
			setReviewFrom(intialState);
		} catch (error: any) {
			if (error.response) {
				if (Array.isArray(error.response?.data?.message)) {
					error.response.data.message.forEach((message: any) => {
						toast.error(message);
					});
				} else {
					toast.error(error.response.data.message);
				}
			} else {
				toast.error(error.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (e: any, id: string) => {
		e.preventDefault();
		try {
			setIsLoading(true);
			const delProdRes = await Products.deleteReview(productId, id);
			toast.success(delProdRes.message);
			setAllReviews(delProdRes.result.feedbackDetails);
			setFilteredReviews(delProdRes.result.feedbackDetails);
			setReviewFrom(intialState);
		} catch (error: any) {
			if (error.response) {
				if (Array.isArray(error.response?.data?.message)) {
					error.response.data.message.forEach((message: any) => {
						toast.error(message);
					});
				} else {
					toast.error(error.response.data.message);
				}
			} else {
				toast.error(error.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<ToastContainer /> {/* Add the ToastContainer */}
			{user && user.email && (
				<div>
					{!formShown && (
						<Button
							variant='outline-info'
							className='addReview'
							onClick={() => {
								setFormShown(true);
							}}
						>
							Add review
						</Button>
					)}
					{formShown && (
						<div className='reviewInputZone'>
							<Form>
								<Form.Group className='mb-3'>
									<Form.Label>Your Rating</Form.Label>
									<br />
									<ReactStars
										count={5}
										value={reviewForm.rating}
										onChange={(newRating: any) =>
											setReviewFrom({ ...reviewForm, rating: newRating })
										}
										size={30}
										activeColor="#ffd700"
									/>
								</Form.Group>
								<Form.Group className='mb-3'>
									<Form.Label>Your Review</Form.Label>
									<Form.Control
										as='textarea'
										rows={3}
										value={reviewForm.review}
										onChange={(e) =>
											setReviewFrom({ ...reviewForm, review: e.target.value })
										}
									/>
								</Form.Group>
								<Button
									variant='secondary'
									onClick={() => {
										setReviewFrom(intialState);
										setFormShown(false);
									}}
								>
									Cancel
								</Button>{' '}
								<Button
									variant='primary'
									type='submit'
									onClick={(e) => handleSubmit(e)}
								>
									Submit
								</Button>
							</Form>
						</div>
					)}
					<hr />
				</div>
			)}

			<div className='filterRating'>
				<h5>Filter By - </h5>
				<ReactStars
					count={5}
					value={filterValue}
					onChange={(newRating: React.SetStateAction<number>) => {
						const filteredAllReview: Record<string, any>[] =
							filteredReviews.filter((value) => value.rating === newRating);
						setAllReviews(filteredAllReview);
						setFilterValue(newRating);
					}}
					size={30}
					activeColor="#ffd700"
				/>
				<Button
					className='reloadBtn'
					variant='outline-secondary'
					onClick={() => {
						setAllReviews(filteredReviews);
						setFilterValue(0);
					}}
				>
					<ArrowClockwise />
				</Button>
			</div>
			<div className='reviewZone'>
				{' '}
				{allReviews.map((review, index) => (
					<Card
						bg='light'
						key={index}
						text='dark'
						style={{ width: '100%' }}
						className='mb-2'
					>
						<Card.Header className='reviewHeader'>
							<PersonFill className='personReview' />
							{review.customerName}
							<ReactStars
								count={5}
								value={review.rating}
								edit={false}
								size={24}
								activeColor="#ffd700"
							/>
						</Card.Header>
						<Card.Body>
							<Card.Text>
								<p className='reviewDt'>{review.updatedAt}</p>
								{review.feedbackMsg}
							</Card.Text>
							<Button
								variant='danger'
								onClick={(e) => handleDelete(e, review._id)}
								disabled={isLoading}
							>
								Delete
							</Button>
						</Card.Body>
					</Card>
				))}
				{allReviews.length < 1 && <h5>No reviews</h5>}
			</div>
		</div>
	);
};

export default ReviewSection;
