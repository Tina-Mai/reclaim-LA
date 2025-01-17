import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

export default function Terms() {
	return (
		<div>
			<div className="vertical w-full justify-center items-center pt-28 md:pt-32 pb-8 px-5 text-sm">
				<Header />
				<div className="vertical max-w-prose gap-6">
					<h1 className="font-serif text-6xl md:text-7xl">Terms of Service</h1>
					<p>
						<b>Last updated:</b> January 17, 2025
					</p>
					<p>
						These Terms of Service (&quot;Terms&quot;) govern your use of ReclaimLA.org (the &quot;Site&quot;) and the services (collectively, &quot;Services&quot;) provided by Reclaim
						(&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By accessing or using our Site or Services, you agree to be bound by these Terms. If you do not agree, please discontinue use
						of our Site and Services immediately.
					</p>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">1. Eligibility</h2>
						<p>By using our Site or Services, you represent that:</p>
						<ul className="list-decimal list-outside pl-4">
							<li>You are at least 18 years of age (or the age of majority in your jurisdiction).</li>
							<li>You have the legal capacity to enter into a binding contract.</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">2. Use of Services</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>
								Purpose of Services: Reclaimprovides an automated voice AI service to help you catalog items lost in a fire, generates a transcription, and sends an inventory list
								(CSV) to your email.
							</li>
							<li>
								User Responsibilities:
								<ul className="list-disc list-outside pl-4 mt-2">
									<li>You agree to provide accurate, complete, and up-to-date information.</li>
									<li>You are responsible for safeguarding the confidentiality of any account credentials or personal details you provide.</li>
									<li>You agree not to use the Services for any unlawful or fraudulent purposes.</li>
									<li>You agree that we may contact you via email or phone number about new features, improvements, or important updates related to Reclaim&apos;s services.</li>
								</ul>
							</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">3. Intellectual Property</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>
								Ownership: All content on the Site, including text, graphics, logos, and software, is owned by or licensed to Reclaimand is protected by intellectual property laws.
							</li>
							<li>
								Limited License: We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Site and Services for your personal, non-commercial use. You
								agree not to reproduce, distribute, modify, or create derivative works from any content without our express written consent.
							</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">4. Data and Privacy</h2>
						<ul className="list-decimal list-outside pl-4">
							<li>
								Privacy Policy: Your use of the Services is also governed by our Privacy Policy. By using our Services, you consent to the collection, use, and disclosure of your
								information as described in our Privacy Policy.
							</li>
							<li>
								Data Deletion: We automatically delete your personal data and transcripts after 30 days unless you request otherwise. You can request data deletion or copies of your
								data at any time by emailing team@reclaimAI.org.
							</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">5. Disclaimer of Warranties</h2>
						<p>You expressly understand and agree that:</p>
						<ul className="list-decimal list-outside pl-4">
							<li>
								As Is Basis: Our Site and Services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, express or implied, regarding the
								reliability, accuracy, or completeness of the Services.
							</li>
							<li>No Guarantee: We do not guarantee that the Services will meet your requirements, be uninterrupted, timely, secure, or error-free.</li>
						</ul>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
						<p>
							To the fullest extent permitted by law, Reclaimand its owners, employees, or agents shall not be liable for any direct, indirect, incidental, special, consequential, or
							exemplary damages arising out of or in connection with your use of the Site or Services.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">7. Indemnification</h2>
						<p>
							You agree to indemnify and hold harmless Reclaim, its affiliates, employees, and agents from any claims, damages, losses, liabilities, or expenses (including
							attorney&apos;s fees) arising out of or related to your use of the Site or Services, or your breach of these Terms.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">8. Termination</h2>
						<p>
							We reserve the right to suspend or terminate your access to the Site or Services at any time, with or without cause or notice, if we believe you have violated these Terms
							or engaged in any fraudulent or unlawful activity.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">9. Modifications to the Services or Terms</h2>
						<p>
							We reserve the right to modify, suspend, or discontinue any part of our Site or Services at any time. We may also revise these Terms from time to time. If we make material
							changes, we will notify you by posting a notice on our Site or sending an email to the address associated with your account. Your continued use of the Site or Services
							after the changes become effective constitutes your acceptance of the revised Terms.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">10. Governing Law and Dispute Resolution</h2>
						<p>
							These Terms shall be governed by and construed in accordance with the laws of California, without regard to its conflict of law provisions. Any disputes arising out of or
							related to these Terms or your use of the Services shall be brought in the state or federal courts located in California, and you consent to the exclusive jurisdiction of
							such courts.
						</p>
					</div>
					<div className="vertical gap-2">
						<h2 className="text-xl font-semibold">11. Contact Information</h2>
						<p>If you have any questions, concerns, or comments about these Terms, please contact us at:</p>
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
