interface Call {
	id: number;
	phone: string;
	created_at: string;
}

interface CallHistoryProps {
	callHistory: Call[];
}

const CallHistory = ({ callHistory }: CallHistoryProps) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="bg-white rounded-lg border">
			<div className="divide-y divide-zinc-200">
				{callHistory.map((call) => (
					<div key={call.id} className="px-6 py-4">
						<div className="text-sm text-zinc-900">Call on {formatDate(call.created_at)}</div>
						<div className="text-sm text-zinc-500">Phone: {call.phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4")}</div>
					</div>
				))}
			</div>
			<div className="px-6 py-4 border-t">
				<div className="text-sm text-zinc-700">{callHistory.length} calls in total</div>
			</div>
		</div>
	);
};

export default CallHistory;
