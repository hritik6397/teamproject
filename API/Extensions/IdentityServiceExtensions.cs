using System.Text;
using Core.Entities.Identity;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions
{
    public static class IdentityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {
            var builder = services.AddIdentityCore<AppUser>();

            builder = new IdentityBuilder(builder.UserType, builder.Services);
            builder.AddEntityFrameworkStores<AppIdentityDbContext>();
            builder.AddSignInManager<SignInManager<AppUser>>().AddEntityFrameworkStores<AppIdentityDbContext>().AddDefaultTokenProviders();
            // services.AddIdentity<AppUser, IdentityRole>(opt => 
            // {
            //     opt.Password.RequiredLength = 7;
            //     opt.Password.RequireDigit = false;

            //     opt.User.RequireUniqueEmail = true;
            // })
            //  .AddEntityFrameworkStores<AppIdentityDbContext>()
            //  .AddDefaultTokenProviders();

            // services.Configure<DataProtectionTokenProviderOptions>(opt =>
            //     opt.TokenLifespan = TimeSpan.FromHours(2));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Token:Key"])),
                        ValidIssuer = config["Token:Issuer"],
                        ValidateIssuer = true,
                        ValidateAudience = false
                    };
                });

            return services;
        }
    }
}