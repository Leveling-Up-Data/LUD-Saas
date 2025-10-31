import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Shield,
    FileText,
    Cookie,
    Eye,
    Users,
    Lock,
    AlertTriangle,
    ExternalLink,
    Calendar,
    Facebook,
    Instagram,
    Linkedin,
    Twitter
} from "lucide-react";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        Privacy Policy
                    </h1>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Introduction */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                PRIVACY POLICY FOR Starfish!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This privacy policy outlines the types of information collected and how it's used by Starfish!,
                                accessible from <a href="https://levelingupdata.com/" className="text-primary hover:underline">https://levelingupdata.com/</a>.
                            </p>
                            <p className="text-muted-foreground">
                                If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at{" "}
                                <a href="mailto:support@levelingupdata.com" className="text-primary hover:underline">
                                    support@levelingupdata.com
                                </a>
                                .
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Log Files */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-5 h-5 text-primary" />
                                LOG FILES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Starfish! follows a standard procedure of using log files. These files log visitors when they visit websites.
                                All hosting companies do this and a part of hosting services' analytics. The information collected by log files include:
                            </p>
                            <ul className="space-y-2 text-muted-foreground ml-4">
                                <li>• IP addresses</li>
                                <li>• Browser type</li>
                                <li>• Internet Service Provider (ISP)</li>
                                <li>• Date and time stamp</li>
                                <li>• Referring/exit pages</li>
                                <li>• Click counts</li>
                            </ul>
                            <p className="text-muted-foreground">
                                These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends,
                                administering the site, tracking users' movement on the website, and gathering demographic information.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Cookies and Web Beacons */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Cookie className="w-5 h-5 text-primary" />
                                COOKIES AND WEB BEACONS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Like any other website, Starfish! uses 'cookies'. These cookies are used to store information including visitors'
                                preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users'
                                experience by customizing our web page content based on visitors' browser type and/or other information.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Google DoubleClick DART Cookie */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ExternalLink className="w-5 h-5 text-primary" />
                                GOOGLE DOUBLECLICK DART COOKIE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site
                                visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline
                                the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL –{" "}
                                <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                    https://policies.google.com/privacy
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Our Advertising Partners */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Eye className="w-5 h-5 text-primary" />
                                OUR ADVERTISING PARTNERS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our
                                advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their
                                Privacy Policies below.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="font-medium text-foreground mb-2">Advertising Partners:</p>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Google</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Privacy Policies */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-5 h-5 text-primary" />
                                PRIVACY POLICIES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                You may consult this list to find the Privacy Policy for each of the advertising partners of Starfish!.
                            </p>
                            <p className="text-muted-foreground">
                                Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their
                                respective advertisements and links that appear on Starfish!, which are sent directly to users' browser. They automatically
                                receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns
                                and/or to personalize the advertising content that you see on websites that you visit.
                            </p>
                            <p className="text-muted-foreground">
                                Note that Starfish! has no access to or control over these cookies that are used by third-party advertisers.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Third Party Privacy Policies */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="w-5 h-5 text-primary" />
                                THIRD PARTY PRIVACY POLICIES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Starfish!'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the
                                respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and
                                instructions about how to opt-out of certain options.
                            </p>
                            <p className="text-muted-foreground">
                                You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management
                                with specific web browsers, it can be found at the browsers' respective websites. What Are Cookies?
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Children's Information */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                CHILDREN'S INFORMATION
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to
                                observe, participate in, and/or monitor and guide their online activity.
                            </p>
                            <p className="text-muted-foreground">
                                Starfish! does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think
                                that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will
                                do our best efforts to promptly remove such information from our records.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Online Privacy Policy Only */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Lock className="w-5 h-5 text-primary" />
                                ONLINE PRIVACY POLICY ONLY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information
                                that they shared and/or collect in Starfish!. This policy is not applicable to any information collected offline or via
                                channels other than this website.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Consent */}
                <section className="mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-5 h-5 text-primary" />
                                CONSENT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <Footer />
        </div>
    );
}
