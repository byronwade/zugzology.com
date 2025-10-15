"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";

export function DetailsSection() {
	return (
		<div className="shopify-section PP-details">
			<div className="ds-container" style={{ backgroundColor: "#FFEED1" }}>
				<div className="content">
					<div className="text-area">
						<h2 className="ds-heading">GROW DUNG-LOVING MUSHROOMS</h2>
						<p className="ds-des" style={{ fontWeight: 500 }} />
					</div>
					<div className="wrappp">
						<div className="img-icon-wrap">
							<Image alt="High Yield" className="icon-img" height={100} src="/icons/icon-01.png" width={100} />
							<div className="column--text">
								<h3 className="ds-subheading h3-style">HIGH YIELD</h3>
								<p className="icon-txt">Grow up to 2.5 lbs of dung-loving mushrooms.</p>
							</div>
						</div>

						<div className="img-icon-wrap">
							<Image alt="Simple Setup" className="icon-img" height={100} src="/icons/icon-02.png" width={100} />
							<div className="column--text">
								<h3 className="ds-subheading h3-style">SIMPLE SETUP</h3>
								<p className="icon-txt">Mushrooms grow in the bag. Ditch the bin and other costly supplies!</p>
							</div>
						</div>

						<div className="img-icon-wrap">
							<Image alt="Video Guides" className="icon-img" height={100} src="/icons/video2.png" width={100} />
							<div className="column--text">
								<h3 className="ds-subheading h3-style">
									<Link href="/pages/mushroom-growing-guides">VIDEO GUIDES</Link>
								</h3>
								<p className="icon-txt">Step-by-step videos and timely email alerts make growing easy.</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.ds-container {
					height: auto;
					width: 100%;
					background-repeat: no-repeat;
					background-size: 100% 100%;
					padding: 80px 0;
				}

				.ds-heading {
					text-align: center;
					justify-content: center;
					color: black;
					font-weight: 800;
					margin-bottom: 0;
					line-height: 120%;
					font-size: 2.5rem;
				}

				.ds-subheading {
					margin-bottom: 0.5em;
					text-align: center;
					font-size: 1.5rem;
					font-weight: 600;
				}

				.ds-des,
				.icon-txt {
					margin-top: 0;
					text-align: center;
					justify-content: center;
					color: black;
					font-size: 20px;
					line-height: normal;
				}

				.wrappp {
					display: flex;
					justify-content: space-around;
					margin-top: 36px;
					max-width: 1200px;
					margin-left: auto;
					margin-right: auto;
				}

				.img-icon-wrap {
					width: 20%;
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				@media only screen and (max-width: 767px) {
					.wrappp {
						flex-direction: column;
						margin-top: 13px;
						gap: 20px;
					}

					.img-icon-wrap {
						display: flex;
						gap: 20px;
						width: 90%;
						justify-content: flex-start;
						text-align: left;
						margin: auto;
						flex-direction: row;
					}

					.icon-img {
						width: 70px;
						height: 70px;
						margin: 0;
					}

					.ds-subheading {
						font-size: 20px;
						text-align: left;
					}

					.icon-txt {
						text-align: left;
						font-size: 15px;
						flex-wrap: wrap;
						align-content: center;
					}

					.ds-container {
						height: auto;
						padding: 50px 0;
					}

					.ds-heading {
						line-height: 120%;
						padding-top: 23px;
						font-size: 2rem;
					}
				}
			`}</style>
		</div>
	);
}
