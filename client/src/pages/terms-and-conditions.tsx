import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import {
    FileText,
    Shield,
    AlertTriangle,
    Users,
    Lock,
    ExternalLink,
    Scale,
    Cookie,
    Eye,
    FileEdit
} from "lucide-react";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        Terms and Conditions
                    </h1>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 1. Agreement to Terms */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-5 h-5 text-primary" />
                                1. AGREEMENT TO TERMS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                By accessing or using Leveling Up Data! (<a href="https://levelingupdata.com/" className="text-primary hover:underline">https://levelingupdata.com/</a>), 
                                you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree, please do not use our website.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 2. Use of the Website */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="w-5 h-5 text-primary" />
                                2. USE OF THE WEBSITE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                You agree to use the Site only for lawful purposes. You shall not engage in any activity that may disrupt the Site or infringe upon others' rights. 
                                Failure to comply may result in immediate termination of access.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 3. Privacy */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Lock className="w-5 h-5 text-primary" />
                                3. PRIVACY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and share information. By using the site, you consent to our privacy practices.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 4. Intellectual Property */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-5 h-5 text-primary" />
                                4. INTELLECTUAL PROPERTY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                All content on the Site—including text, graphics, logos, and images—is owned or licensed by Leveling Up Data! and is protected under intellectual property laws. 
                                You may not copy, reproduce, or distribute material without prior written consent.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 5. Disclaimers & Limitation of Liability */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                5. DISCLAIMERS & LIMITATION OF LIABILITY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                The Site is provided "as-is" without warranties of any kind. We do not guarantee accuracy or completeness of content. 
                                Leveling Up Data! will not be liable for any damages arising from your use of the website.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 6. Third-Party Links and Advertisers */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ExternalLink className="w-5 h-5 text-primary" />
                                6. THIRD‑PARTY LINKS AND ADVERTISERS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We may have links to third-party websites and content. We do not control these external sites and are not responsible for their content or privacy practices.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 7. Advertisements and Cookies */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Cookie className="w-5 h-5 text-primary" />
                                7. ADVERTISEMENTS AND COOKIES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Our Site may display ads via third-party partners who may use cookies, web beacons, and similar technologies to serve personalized ads. 
                                We have no control over these practices. You can learn more in our Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 8. Log Files */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Eye className="w-5 h-5 text-primary" />
                                8. LOG FILES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We collect log file information—such as IP address, browser type, ISP, referral pages, and click data—to analyze trends and administer the Site. 
                                This information is not linked to personally identifiable data.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 9. Children Under 13 */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                9. CHILDREN UNDER 13
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We do not knowingly collect personal information from children under 13. If you believe your child may have submitted personal data, 
                                please contact us, and we will promptly remove it.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 10. Modifications to Terms */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileEdit className="w-5 h-5 text-primary" />
                                10. MODIFICATIONS TO TERMS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We may update these Terms at any time to reflect changes in our services or legal obligations. Users will be notified of significant changes. 
                                Continued use of the Site constitutes acceptance of the new Terms.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 11. Severability */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Scale className="w-5 h-5 text-primary" />
                                11. SEVERABILITY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                If any provision of these Terms is deemed unenforceable, that provision will be removed or limited accordingly, 
                                without affecting the validity of the remaining provisions.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 12. Governing Law & Dispute Resolution */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Scale className="w-5 h-5 text-primary" />
                                12. GOVERNING LAW & DISPUTE RESOLUTION
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of laws rules. 
                                Any dispute arising from these Terms shall be resolved in the courts of [Your Jurisdiction].
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* 13. Contact Us */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ExternalLink className="w-5 h-5 text-primary" />
                                13. CONTACT US
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                If you have any questions or concerns regarding these Terms, please contact us:
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="font-medium text-foreground mb-2">Leveling Up Data!</p>
                                <p className="text-muted-foreground">
                                    Email: <a href="mailto:levelingupdata@gmail.com" className="text-primary hover:underline">levelingupdata@gmail.com</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <Footer />
        </div>
    );
}
