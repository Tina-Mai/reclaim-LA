import { Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadProps<T> {
	data: T[];
	filename: string;
	headers: string[];
	getRowData: (item: T) => string[];
}

const Download = <T,>({ data, filename, headers, getRowData }: DownloadProps<T>) => {
	const downloadCSV = () => {
		// Convert items to CSV rows
		const csvRows = data.map((item) => getRowData(item));

		// Combine headers and rows
		const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Button className="gap-2" onClick={downloadCSV}>
			<DownloadIcon className="size-4" />
			Download
		</Button>
	);
};

export default Download;
