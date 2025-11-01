import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Play, Search, Filter, X, Maximize, Minimize, Download, ArrowLeft, Beaker, Atom, Dna, Calculator, Zap, Star, Crown, Target, ExternalLink } from 'lucide-react';
import AutoText from './AutoText';

const Simulations = () => {
	const navigate = useNavigate();
	const [simulations, setSimulations] = useState([]);
	const [selectedSimulation, setSelectedSimulation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [selectedSubjects, setSelectedSubjects] = useState(new Set());
	const [selectedCategories, setSelectedCategories] = useState(new Set());
	const [categoriesBySubject, setCategoriesBySubject] = useState({});
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
const beurl=import.meta.env.VITE_BACKEND_URL;
	// Filter options - these will match both subject and category fields
	const subjects = [
		{ name: "Physics", icon: Atom, color: "bg-blue-500" },
		{ name: "Chemistry", icon: Beaker, color: "bg-green-500" },
		{ name: "Biology", icon: Dna, color: "bg-purple-500" },
		{ name: "Mathematics", icon: Calculator, color: "bg-orange-500" },
		{ name: "Computer Science", icon: Calculator, color: "bg-cyan-500" },
		{ name: "Artificial Intelligence", icon: Zap, color: "bg-purple-500" },
		{ name: "Civil Engineering", icon: Target, color: "bg-amber-500" },
		{ name: "Operating Systems", icon: Calculator, color: "bg-slate-500" },
		{ name: "Algorithms & Data Structures", icon: Target, color: "bg-teal-500" },
		{ name: "Networking", icon: Zap, color: "bg-indigo-500" },
		{ name: "Database Systems", icon: Target, color: "bg-rose-500" },
		{ name: "Machine Learning", icon: Zap, color: "bg-violet-500" },
		{ name: "Electricity & Magnetism", icon: Zap, color: "bg-yellow-500" },
		{ name: "Waves & Sound", icon: Atom, color: "bg-sky-500" },
		{ name: "Forces & Motion", icon: Target, color: "bg-emerald-500" },
		{ name: "Mechanics", icon: Target, color: "bg-orange-500" }
	];

	useEffect(() => {
		fetchSimulations();
	}, []);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape" && isFullscreen) {
				toggleFullscreen();
			}
		};

		if (isFullscreen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "auto";
		};
	}, [isFullscreen]);

	const fetchSimulations = async () => {
		try {
			const token =
				localStorage.getItem("token") || sessionStorage.getItem("token");
			const response = await fetch(`${beurl}/api/simulations`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch simulations");
			}

			const data = await response.json();
			setSimulations(data);

			// Extract categories for each subject
			const categoriesMap = {};
			data.forEach((sim) => {
				if (!categoriesMap[sim.subject]) {
					categoriesMap[sim.subject] = new Set();
				}
				categoriesMap[sim.subject].add(sim.category);
			});

			// Convert sets to arrays
			const finalCategoriesMap = {};
			Object.keys(categoriesMap).forEach((subject) => {
				finalCategoriesMap[subject] = Array.from(categoriesMap[subject]);
			});

			setCategoriesBySubject(finalCategoriesMap);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSimulationClick = (simulation) => {
		setSelectedSimulation(simulation);
	};

	const handleCloseSimulation = () => {
		setSelectedSimulation(null);
		setIsFullscreen(false);
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const handleDownload = () => {
		if (selectedSimulation && selectedSimulation.downloadUrl) {
			window.open(selectedSimulation.downloadUrl, '_blank');
		} else {
			alert('Download not available for this simulation');
		}
	};

	const handleSubjectChange = (subject, checked) => {
		const newSelectedSubjects = new Set(selectedSubjects);
		const newSelectedCategories = new Set(selectedCategories);

		if (checked) {
			newSelectedSubjects.add(subject);
			if (categoriesBySubject[subject]) {
				categoriesBySubject[subject].forEach((cat) =>
					newSelectedCategories.add(cat)
				);
			}
		} else {
			newSelectedSubjects.delete(subject);
			if (categoriesBySubject[subject]) {
				categoriesBySubject[subject].forEach((cat) =>
					newSelectedCategories.delete(cat)
				);
			}
		}

		setSelectedSubjects(newSelectedSubjects);
		setSelectedCategories(newSelectedCategories);
	};

	const handleCategoryChange = (category, checked) => {
		const newSelectedCategories = new Set(selectedCategories);

		if (checked) {
			newSelectedCategories.add(category);
		} else {
			newSelectedCategories.delete(category);
		}

		setSelectedCategories(newSelectedCategories);
	};

	const filteredSimulations = simulations.filter((sim) => {
		// Check if filter matches either subject or category (case-insensitive)
		const matchesSubjects = selectedSubjects.size === 0 || 
			Array.from(selectedSubjects).some(selected => 
				sim.subject.toLowerCase().includes(selected.toLowerCase()) ||
				sim.category.toLowerCase().includes(selected.toLowerCase()) ||
				selected.toLowerCase().includes(sim.subject.toLowerCase()) ||
				selected.toLowerCase().includes(sim.category.toLowerCase())
			);
		
		const matchesCategories = selectedCategories.size === 0 || selectedCategories.has(sim.category);
		const matchesFilters = matchesSubjects && matchesCategories;

		const matchesSearch = searchQuery === "" ||
			sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sim.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sim.category.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesFilters && matchesSearch;
	});

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center p-4 relative">
				<div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm w-full max-w-md">
					<div className="flex items-center justify-center space-x-3 mb-4">
						<div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm">
							<Zap className="w-8 h-8 text-white" />
						</div>
					</div>
					<div className="text-center">
						<h2 className="text-3xl font-bold text-[#3E5F44] mb-2">
							Loading Simulations
						</h2>
						<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-4">
							<div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] h-full rounded-full animate-pulse"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full h-full flex items-center justify-center p-4 relative">
				<div className="bg-white border border-red-300 rounded-3xl p-8 shadow-sm w-full max-w-md">
					<div className="flex items-center justify-center space-x-3 mb-4">
						<div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 rounded-full shadow-sm">
							<X className="w-8 h-8 text-white" />
						</div>
					</div>
					<div className="text-center">
						<h2 className="text-3xl font-bold text-red-700 mb-2">
							Error Loading
						</h2>
						<p className="text-gray-600">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full flex items-center justify-center px-5 py-4 relative bg-gradient-to-br from-[#E8FFD7] to-white">
			{!selectedSimulation ? (
				<div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 shadow-sm w-full">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center space-x-4">
							<div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm">
								<Beaker className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-[#3E5F44]">
									<AutoText>Educational Simulations</AutoText>
								</h1>
								<p className="text-[#557063]">
									<AutoText>Explore interactive learning experiences</AutoText>
								</p>
							</div>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
								showFilters 
									? 'bg-[#5E936C]/20 border-[#5E936C] text-[#3E5F44]' 
									: 'bg-[#E8FFD7] hover:bg-[#93DA97]/30 border-[#93DA97]/30 text-[#557063]'
							} border shadow-sm`}
						>
							<Filter className="w-4 h-4" />
							<AutoText>Filters</AutoText>
						</button>
					</div>

					{/* Search Bar */}
					<div className="relative mb-6">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search simulations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-4 py-3 bg-white border border-[#93DA97]/30 rounded-xl text-[#3E5F44] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E936C]/20 focus:border-[#5E936C] transition-all duration-200"
						/>
					</div>

					{/* Filters Section */}
					{showFilters && (
						<div className="mb-6 p-4 bg-[#E8FFD7] rounded-xl border border-[#93DA97]/30">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-[#3E5F44]">
									<AutoText>Filter by Subject</AutoText>
								</h3>
								{selectedSubjects.size > 0 && (
									<button
										onClick={() => setSelectedSubjects(new Set())}
										className="text-sm text-[#5E936C] hover:text-[#3E5F44] transition-colors"
									>
										Clear All
									</button>
								)}
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
								{subjects.map((subject) => {
									const IconComponent = subject.icon;
									return (
										<label
											key={subject.name}
											className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
												selectedSubjects.has(subject.name)
													? subject.color + ' text-white shadow-sm scale-105'
													: 'bg-white hover:bg-gray-50 text-[#557063] border border-gray-200'
											}`}
										>
											<input
												type="checkbox"
												checked={selectedSubjects.has(subject.name)}
												onChange={(e) => handleSubjectChange(subject.name, e.target.checked)}
												className="w-4 h-4 text-[#5E936C] rounded focus:ring-[#5E936C]"
											/>
											<IconComponent className="w-4 h-4 flex-shrink-0" />
											<span className="text-sm font-medium truncate">{subject.name}</span>
										</label>
									);
								})}
							</div>
							{selectedSubjects.size > 0 && (
								<div className="mt-4 flex items-center space-x-2">
									<span className="text-[#557063] text-sm">Active Filters:</span>
									<div className="flex flex-wrap gap-2">
										{Array.from(selectedSubjects).map((subject) => (
											<span
												key={subject}
												className="px-3 py-1 bg-[#5E936C]/20 text-[#3E5F44] text-xs font-medium rounded-full flex items-center space-x-2 border border-[#5E936C]/30"
											>
												<span>{subject}</span>
												<button
													onClick={() => handleSubjectChange(subject, false)}
													className="hover:text-[#5E936C] transition-colors"
												>
													<X className="w-3 h-3" />
												</button>
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Simulations Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
						{filteredSimulations.length > 0 ? (
							filteredSimulations.map((simulation) => (
								<div
									key={simulation._id}
									className="group p-6 bg-[#E8FFD7] hover:bg-[#93DA97]/30 border border-[#93DA97]/30 hover:border-[#5E936C] rounded-xl transition-all duration-200 hover:shadow-md"
								>
									<div className="flex items-start justify-between mb-4">
										<div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
											<Play className="w-6 h-6 text-white" />
										</div>
										<span className="px-3 py-1 bg-white border border-[#93DA97]/50 text-[#557063] text-xs font-medium rounded-full">
											{simulation.subject}
										</span>
									</div>
									<h3 
										onClick={() => handleSimulationClick(simulation)}
										className="text-xl font-bold text-[#3E5F44] mb-2 group-hover:text-[#5E936C] transition-colors duration-200 cursor-pointer"
									>
										{simulation.title}
									</h3>
									<p className="text-[#557063] text-sm mb-4 line-clamp-2">
										{simulation.description}
									</p>
									<div className="flex items-center justify-between mb-3">
										<span className="text-gray-500 text-xs">
											{simulation.category}
										</span>
										<div className="flex items-center space-x-1">
											<Star className="w-4 h-4 text-yellow-500" />
											<span className="text-[#557063] text-sm">4.5</span>
										</div>
									</div>
									<div className="flex items-center justify-between gap-2">
										<button
											onClick={() => handleSimulationClick(simulation)}
											className="flex-1 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
										>
											<Play className="w-4 h-4" />
											Quick View
										</button>
										<button
											onClick={() => navigate(`/simulation/${simulation.slug}`)}
											className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
										>
											<ExternalLink className="w-4 h-4" />
											Full Page
										</button>
									</div>
								</div>
							))
						) : (
							<div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
								<Target className="w-16 h-16 text-gray-300 mb-4" />
								<h3 className="text-xl font-semibold text-[#557063] mb-2">
									<AutoText>No simulations found</AutoText>
								</h3>
								<p className="text-gray-500">
									<AutoText>Try adjusting your search or filters</AutoText>
								</p>
							</div>
						)}
					</div>
				</div>
			) : (
				// Full-screen Simulation Viewer with clean design
				<div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} bg-white border border-[#93DA97]/30 rounded-3xl shadow-sm overflow-hidden`}>
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-[#93DA97]/30 bg-[#E8FFD7]">
						<div className="flex items-center space-x-4">
							<button
								onClick={handleCloseSimulation}
								className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-gray-700 transition-all duration-200"
							>
								<ArrowLeft className="w-4 h-4" />
								<AutoText>Back</AutoText>
							</button>
							<div>
								<h2 className="text-xl font-bold text-[#3E5F44]">{selectedSimulation.title}</h2>
								<p className="text-[#557063] text-sm">{selectedSimulation.subject} • {selectedSimulation.category}</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<button
								onClick={handleDownload}
								className="flex items-center space-x-2 px-4 py-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-xl text-white transition-all duration-200 shadow-sm"
							>
								<Download className="w-4 h-4" />
								<AutoText>Download</AutoText>
							</button>
						</div>
					</div>

					{/* Simulation Iframe - Takes full remaining space */}
					<div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-200px)]'}`}>
						{isFullscreen && (
							<button
								onClick={toggleFullscreen}
								className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-all duration-200 border border-gray-300 shadow-sm"
								title="Exit Fullscreen (ESC)"
							>
								<X className="w-6 h-6" />
							</button>
						)}
						<iframe
							src={selectedSimulation.iframeUrl}
							title={selectedSimulation.title}
							className="w-full h-full border-0 rounded-b-3xl"
							allowFullScreen
						/>
					</div>

					{/* Description - Only show when not fullscreen */}
					{!isFullscreen && (
						<div className="p-6 bg-[#E8FFD7] border-t border-[#93DA97]/30">
							<h3 className="text-lg font-semibold text-[#3E5F44] mb-3">
								<AutoText>About this Simulation</AutoText>
							</h3>
							<p className="text-[#557063] leading-relaxed">
								{selectedSimulation.description}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Simulations;