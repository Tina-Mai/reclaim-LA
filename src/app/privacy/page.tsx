import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

export default function Privacy() {
	return (
		<div>
			<div className="vertical w-full justify-center items-center pt-28 md:pt-32 pb-8 px-5 text-sm">
				<Header />
				<div className="vertical max-w-prose gap-6">
					<h1 className="font-serif text-6xl md:text-7xl">Privacy Policy</h1>
					<p>
						<b>Last updated:</b> January 17, 2025
					</p>
					<p>
						Thank you for choosing ReclaimLA.org (Reclaim,” “we,” “us,” or “our”). We value the trust you place in us when you provide your personal information and are committed to
						maintaining that trust. This Privacy Policy describes how we collect, use, store, and protect your information when you use our services.
					</p>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">1. Information We Collect</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>Personal Information: We may collect personal information you provide to us, such as your name, phone number, and email address.</li>
							<li>Call Transcriptions: When you use our automated voice AI to catalog items lost in a fire, we record and transcribe the call to generate an inventory list for you.</li>
							<li>
								Usage Data: We may collect non-personal information about how you interact with our website and services (e.g., browser type, device information, pages visited, and
								time spent on each page).
							</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>Service Delivery: We use your information to provide our automated calling and inventory services, including generating and sending you a CSV of your inventory.</li>
							<li>
								Communications: We may send you emails regarding your requested services or updates to our policies. We will not send you marketing or promotional materials without
								your explicit consent.
							</li>
							<li>
								Product Updates: We may contact you via email or phone number to inform you about new features, improvements, or important updates related to Reclaim&apos;s services.
							</li>
							<li>Improving Our Services: We analyze the data we collect to understand usage trends, improve our platform, and enhance user experience.</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">3. Data Retention and Deletion</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>
								Retention Period: We store your personal information and call transcriptions for up to one month (30 days) unless you request otherwise. After this period, we
								automatically delete all collected data from our systems.
							</li>
							<li>User Requests: You may request deletion of your data, or request copies of your data, at any time by emailing team@reclaimAI.org.</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">4. Data Security</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>
								Security Measures: We implement reasonable and appropriate technical, administrative, and physical safeguards designed to protect your information from unauthorized
								access, disclosure, alteration, or destruction.
							</li>
							<li>No Sale of Personal Data: We will never sell or share your personal information with third parties for marketing purposes.</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">5. Disclosure of Your Information</h2>
						<p>We may disclose your information only in the following circumstances:</p>
						<ul className="list-decimal list-outside pl-4">
							<li>Legal Requirements: If required to do so by law or in response to a valid legal request from a governmental authority.</li>
							<li>
								Business Transfers: In the event of any merger, acquisition, or sale of all or a portion of our assets, your personal information may be transferred as part of that
								transaction. We will provide notice before your personal information is transferred and becomes subject to a different privacy policy.
							</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">6. Children&apos;s Privacy</h2>
						<p>
							Our services are not intended for individuals under the age of 13, and we do not knowingly collect information from children. If you believe a child under 13 has provided
							personal information to us, please contact us so we can promptly delete that information.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">7. Your Rights</h2>
						<p>Depending on your location and applicable laws, you may have the right to:</p>
						<ul className="list-decimal list-outside pl-4">
							<li>Access, Correct, or Delete your personal information.</li>
							<li>Withdraw Consent to the processing of your personal information.</li>
							<li>Request a Copy of the data we hold about you.</li>
						</ul>
						<p>To exercise these rights, or if you have any questions about how we handle your data, please contact us at team@reclaimAI.org.</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">8. Changes to This Privacy Policy</h2>
						<p>
							We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. If we make material changes,
							we will provide a notice on our website or notify you via email prior to the changes becoming effective.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">9. Contact Us</h2>
						<p>If you have any questions, concerns, or comments about this Privacy Policy, please contact us at:</p>
						<ul className="list-disc list-outside pl-4">
							<li>Email: team@reclaimAI.org</li>
						</ul>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
