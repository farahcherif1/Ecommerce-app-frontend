import Link from 'next/link';
import React, { useEffect } from 'react';
import {
	Badge,
	Button,
	Dropdown,
	DropdownButton,
	Row,
	Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify'; // import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // import toastify css
import { Orders } from '../../services/order.service';

const AllOrders = () => {
	const [orders, setOrders] = React.useState([]);

	useEffect(() => {
		fetchItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchItems = async (status?: string) => {
		try {
			const response = await Orders.getAllOrders(status);
			if (!response.success) {
				throw new Error(response.message);
			}
			setOrders(response.result);
		} catch (error: any) {
			if (error.response) {
				if (Array.isArray(error.response?.data?.message)) {
					error.response.data.message.forEach((message: any) => {
						toast.error(message, { autoClose: 3000 });
					});
				} else {
					toast.error(error.response.data.message, { autoClose: 3000 });
				}
			} else {
				toast.error(error.message, { autoClose: 3000 });
			}
		}
	};

	const dateTOLocal = (date: any) => {
		return new Date(date).toLocaleString();
	};

	return (
		<>
			<Row>
				<DropdownButton
					variant='outline-secondary'
					title='Filter by status'
					id='input-group-dropdown-2'
					onSelect={(e) => {
						fetchItems(e ? e : '');
					}}
				>
					<Dropdown.Item href='#' eventKey=''>
						All
					</Dropdown.Item>
					<Dropdown.Item href='#' eventKey='pending'>
						Pending
					</Dropdown.Item>
					<Dropdown.Item href='#' eventKey='completed'>
						Complete
					</Dropdown.Item>
				</DropdownButton>
			</Row>
			<Table responsive>
				<thead>
					<tr>
						<th>Order ID</th>
						<th>Order Date</th>
						<th>Order Status</th>
						<th>Order Total</th>
						<th>Order Actions</th>
					</tr>
				</thead>
				<tbody>
					{orders.length > 0 ? (
						orders.map((order: any) => (
							<tr key={order._id}>
								<Link href={`/orders/${order._id}`}>
									<td style={{ color: 'green', cursor: 'pointer' }}>{order.orderId}</td>
								</Link>
								<td>{dateTOLocal(order.createdAT)}</td>
								<td>
									<Badge>{order.orderStatus.toUpperCase()}</Badge>
								</td>
								<td>₹{order.paymentInfo.paymentAmount}</td>
								<td>
									<Link href={`/orders/${order._id}`}>
										<Button variant='outline-dark'>View Order Details</Button>
									</Link>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={5}>No orders found</td>
						</tr>
					)}
				</tbody>
			</Table>
		</>
	);
};

export default AllOrders;
