<p align="center">
    <img src="public/favicon (2).svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">SmartCartAI</h1></p>



## 🔗 Table of Contents

- [📍 Overview](#-overview)
- [👾 Features](#-features)
- [📁 Project Structure](#-project-structure)
  - [📂 Project Index](#-project-index)
- [🚀 Getting Started](#-getting-started)
  - [☑️ Prerequisites](#-prerequisites)
  - [⚙️ Installation](#-installation)
  - [🤖 Usage](#🤖-usage)
  - [🧪 Testing](#🧪-testing)
- [🔰 Contributing](#-contributing)
- [🎗 License](#-license)

---

## 📍 Overview

<code>Save Money. Shop Smarter.
<br>
SmartCart AI is an AI-powered shopping assistant designed to help users track Amazon prices, analyze price trends, compare products, and receive real-time alerts on price drops. It also offers AI-driven customer review analysis and personalized shopping insights, ensuring you always make the best purchasing decisions.
</code>

---

## 👾 Features

<code>✔️ Price Tracking – Monitor price fluctuations and set alerts for price drops.
✔️ Price History Charts – View historical trends to make informed decisions.
✔️ Product Comparison – Compare multiple products side by side.
✔️ AI-Powered Review Analysis – Get insights from customer reviews.
✔️ Real-Time Alerts – Never miss out on discounts and deals.
✔️ Smart Shopping Insights – Personalized AI-driven recommendations.</code>

---

## 📁 Project Structure

```sh
└── SmartCartAI/
    ├── LICENSE
    ├── README.md
    ├── bun.lockb
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   ├── _redirects
    │   ├── favicon.svg
    │   ├── placeholder.svg
    │   ├── shopping-doodle-1.svg
    │   ├── shopping-doodle-2.svg
    │   └── shopping-doodle-3.svg
    ├── src
    │   ├── App.tsx
    │   ├── components
    │   │   ├── CamelPriceChart.tsx
    │   │   ├── CompareButton.tsx
    │   │   ├── CompareNavItem.tsx
    │   │   ├── DashboardSidebar.tsx
    │   │   ├── Features.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Hero.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── PriceHistoryChart.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductChatbot.tsx
    │   │   ├── ProductSearch.tsx
    │   │   ├── RecentlyViewed.tsx
    │   │   ├── SentimentAnalysis.tsx
    │   │   └── ui
    │   ├── contexts
    │   │   └── ComparisonContext.tsx
    │   ├── hooks
    │   │   ├── use-mobile.tsx
    │   │   └── use-toast.ts
    │   ├── index.css
    │   ├── integrations
    │   │   └── supabase
    │   ├── lib
    │   │   └── utils.ts
    │   ├── main.tsx
    │   ├── pages
    │   │   ├── Auth.tsx
    │   │   ├── Compare.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Index.tsx
    │   │   ├── NotFound.tsx
    │   │   ├── ProductDetail.tsx
    │   │   └── Watchlist.tsx
    │   └── vite-env.d.ts
    ├── supabase
    │   ├── config.toml
    │   ├── functions
    │   │   ├── amazon-product-details
    │   │   ├── amazon-product-search
    │   │   ├── check-price-alerts
    │   │   ├── daily-price-tracking
    │   │   ├── gemini-insights
    │   │   ├── keepa-price-history
    │   │   ├── product-chatbot
    │   │   ├── product-sentiment-analysis
    │   │   ├── save-product
    │   │   └── update-product-insights
    │   └── migrations
    │       ├── 20240620213000_add_chat_tables.sql
    │       └── 20240621100000_add_chat_stored_procedures.sql
    ├── tailwind.config.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```


### 📂 Project Index
<details open>
	<summary><b><code>SMARTCARTAI/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/postcss.config.js'>postcss.config.js</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/tsconfig.node.json'>tsconfig.node.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/package-lock.json'>package-lock.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/tsconfig.app.json'>tsconfig.app.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/package.json'>package.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/vite.config.ts'>vite.config.ts</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/index.html'>index.html</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/components.json'>components.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/tailwind.config.ts'>tailwind.config.ts</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/eslint.config.js'>eslint.config.js</a></b></td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- src Submodule -->
		<summary><b>src</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/main.tsx'>main.tsx</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/index.css'>index.css</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/App.tsx'>App.tsx</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/vite-env.d.ts'>vite-env.d.ts</a></b></td>
			</tr>
			</table>
			<details>
				<summary><b>contexts</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/contexts/ComparisonContext.tsx'>ComparisonContext.tsx</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>lib</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/lib/utils.ts'>utils.ts</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>integrations</b></summary>
				<blockquote>
					<details>
						<summary><b>supabase</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/integrations/supabase/types.ts'>types.ts</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/integrations/supabase/client.ts'>client.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/PriceHistoryChart.tsx'>PriceHistoryChart.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ProductCard.tsx'>ProductCard.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/Footer.tsx'>Footer.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/CamelPriceChart.tsx'>CamelPriceChart.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ProductSearch.tsx'>ProductSearch.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/DashboardSidebar.tsx'>DashboardSidebar.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/Hero.tsx'>Hero.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/CompareButton.tsx'>CompareButton.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/Navbar.tsx'>Navbar.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/RecentlyViewed.tsx'>RecentlyViewed.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/Features.tsx'>Features.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ProductChatbot.tsx'>ProductChatbot.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/CompareNavItem.tsx'>CompareNavItem.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/SentimentAnalysis.tsx'>SentimentAnalysis.tsx</a></b></td>
					</tr>
					</table>
					<details>
						<summary><b>ui</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/context-menu.tsx'>context-menu.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/toaster.tsx'>toaster.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/accordion.tsx'>accordion.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/alert-dialog.tsx'>alert-dialog.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/radio-group.tsx'>radio-group.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/checkbox.tsx'>checkbox.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/input-otp.tsx'>input-otp.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/sheet.tsx'>sheet.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/progress.tsx'>progress.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/badge.tsx'>badge.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/breadcrumb.tsx'>breadcrumb.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/sidebar.tsx'>sidebar.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/pagination.tsx'>pagination.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/label.tsx'>label.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/scroll-area.tsx'>scroll-area.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/input.tsx'>input.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/textarea.tsx'>textarea.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/toast.tsx'>toast.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/separator.tsx'>separator.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/toggle-group.tsx'>toggle-group.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/command.tsx'>command.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/popover.tsx'>popover.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/slider.tsx'>slider.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/form.tsx'>form.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/select.tsx'>select.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/button.tsx'>button.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/drawer.tsx'>drawer.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/toggle.tsx'>toggle.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/dialog.tsx'>dialog.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/alert.tsx'>alert.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/carousel.tsx'>carousel.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/navigation-menu.tsx'>navigation-menu.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/table.tsx'>table.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/tabs.tsx'>tabs.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/skeleton.tsx'>skeleton.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/use-toast.ts'>use-toast.ts</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/switch.tsx'>switch.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/dropdown-menu.tsx'>dropdown-menu.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/collapsible.tsx'>collapsible.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/menubar.tsx'>menubar.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/resizable.tsx'>resizable.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/chart.tsx'>chart.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/avatar.tsx'>avatar.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/hover-card.tsx'>hover-card.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/aspect-ratio.tsx'>aspect-ratio.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/calendar.tsx'>calendar.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/tooltip.tsx'>tooltip.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/sonner.tsx'>sonner.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/components/ui/card.tsx'>card.tsx</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>hooks</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/hooks/use-toast.ts'>use-toast.ts</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/hooks/use-mobile.tsx'>use-mobile.tsx</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>pages</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/Compare.tsx'>Compare.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/NotFound.tsx'>NotFound.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/Watchlist.tsx'>Watchlist.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/Auth.tsx'>Auth.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/Index.tsx'>Index.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/ProductDetail.tsx'>ProductDetail.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/src/pages/Dashboard.tsx'>Dashboard.tsx</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- supabase Submodule -->
		<summary><b>supabase</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/config.toml'>config.toml</a></b></td>
			</tr>
			</table>
			<details>
				<summary><b>functions</b></summary>
				<blockquote>
					<details>
						<summary><b>amazon-product-details</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/amazon-product-details/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>keepa-price-history</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/keepa-price-history/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>update-product-insights</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/update-product-insights/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>product-chatbot</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/product-chatbot/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>save-product</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/save-product/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>product-sentiment-analysis</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/product-sentiment-analysis/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>check-price-alerts</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/check-price-alerts/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>daily-price-tracking</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/daily-price-tracking/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>gemini-insights</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/gemini-insights/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>amazon-product-search</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/functions/amazon-product-search/index.ts'>index.ts</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>migrations</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/migrations/20240621100000_add_chat_stored_procedures.sql'>20240621100000_add_chat_stored_procedures.sql</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/supabase/migrations/20240620213000_add_chat_tables.sql'>20240620213000_add_chat_tables.sql</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- public Submodule -->
		<summary><b>public</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/yk0007/SmartCartAI/blob/master/public/_redirects'>_redirects</a></b></td>
			</tr>
			</table>
		</blockquote>
	</details>
</details>

---
## 🚀 Getting Started

### ☑️ Prerequisites

Before getting started with SmartCartAI, ensure your runtime environment meets the following requirements:

- **Package Manager:** Npm


### ⚙️ Installation

Install SmartCartAI using one of the following methods:

**Build from source:**

1. Clone the SmartCartAI repository:
```sh
❯ git clone https://github.com/yk0007/SmartCartAI
```

2. Navigate to the project directory:
```sh
❯ cd SmartCartAI
```

3. Install the project dependencies:


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```




### 🤖 Usage
Run SmartCartAI using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```


### 🧪 Testing
Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```


---

## 🔰 Contributing

- **💬 [Join the Discussions](https://github.com/yk0007/SmartCartAI/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/yk0007/SmartCartAI/issues)**: Submit bugs found or log feature requests for the `SmartCartAI` project.
- **💡 [Submit Pull Requests](https://github.com/yk0007/SmartCartAI/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/yk0007/SmartCartAI
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>



---

## 🎗 License

This project is protected under the Apache License 2.0 License. For more details, refer to the [LICENSE](https://github.com/yk0007/SmartCartAI/blob/bea2bf4afea005888faf5182a6cc5faa85369636/LICENSE) file.

---
