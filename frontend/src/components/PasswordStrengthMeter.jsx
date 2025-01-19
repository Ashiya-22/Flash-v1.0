import { Check, X,CircleCheckBig,ShieldCheck } from "lucide-react";

const PasswordCriteria = ({ password }) => {
	const criteria = [
		{ label: "At least 6 characters", met: password.length >= 6 },
		{ label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
		{ label: "Contains lowercase letter", met: /[a-z]/.test(password) },
		{ label: "Contains a number", met: /\d/.test(password) },
		{ label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
	];

	return (
		<div className='mt-2 space-y-1'>
			{criteria.map((item) => (
				<div key={item.label} className='flex items-center text-sm'>
					{item.met ? (
						<Check className='size-4 text-green-500 mr-2' />
					) : (
						<X className='size-4 text-gray-500 mr-2' />
					)}
					<span className={item.met ? "text-green-500" : "text-base-content"}>{item.label}</span>
				</div>
			))}
		</div>
	);
};

const PasswordStrengthMeter = ({ password }) => {
	const getStrength = (pass) => {
		let strength = 0;
		if (pass.length >= 6) strength++;
		if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
		if (pass.match(/\d/)) strength++;
		if (pass.match(/[^a-zA-Z\d]/)) strength++;
		return strength;
	};
	const strength = getStrength(password);

	const getColor = (strength) => {
		if (strength === 0) return "bg-red-500";
		if (strength === 1) return "bg-red-400";
		if (strength === 2) return "bg-yellow-500";
		if (strength === 3) return "bg-yellow-400";
		return "bg-green-500";
	};

	const getStrengthText = (strength) => {
		if (strength === 0) return "Very Weak";
		if (strength === 1) return "Weak";
		if (strength === 2) return "Fair";
		if (strength === 3) return "Good";
		return "Strong";
	};

	return (
		<div className='mt-9 gap-y-3 animate-fadeIn flex flex-col bg-base-300 py-12 px-16 rounded-lg'>
            <div className="text-lg mb-6 font-bold flex gap-x-2 items-center"><CircleCheckBig className="font-bold text-green-500"/>Let's ensure a strong password !</div>
			<div className='flex justify-between items-center mb-1'>
				<span className='text-sm text-base-content font-medium'>Password strength</span>
				<span className='text-sm text-base-content font-medium'>{getStrengthText(strength)}</span>
			</div>

			<div className='flex space-x-1'>
				{[...Array(4)].map((_, index) => (
					<div
						key={index}
						className={`h-1 w-1/4 rounded-full transition-colors duration-300 
                ${index < strength ? getColor(strength) : "bg-gray-600"}
              `}
					/>
				))}
			</div>
			<PasswordCriteria password={password} />
            <div className="text-sm mt-6 flex gap-x-1 items-center justify-center text-base-content"><ShieldCheck className="w-5 h-5"/><span className="italic">End-to-end encrypted</span></div>
		</div>
	);
};
export default PasswordStrengthMeter;