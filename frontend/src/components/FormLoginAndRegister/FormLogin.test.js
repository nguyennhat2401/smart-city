
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FormLogin from "./FormLogin";
import { BrowserRouter } from "react-router-dom";
beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
});
// Mock notification antd
jest.mock("antd", () => ({
    notification: {
        useNotification: () => [
            {
                success: jest.fn(),
                error: jest.fn(),
            },
            null,
        ],
    },
}));

// Mock navigate
const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
}));

describe("FormLogin Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = jest.fn();

        Storage.prototype.setItem = jest.fn();

        delete window.location;
        window.location = { href: "" };
    });

    test("renders login form", () => {
        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        expect(
            screen.getByRole("heading", { name: "Đăng nhập" })
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Tài khoản")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Mật khẩu")
        ).toBeInTheDocument();
    });

    test("updates input values", () => {
        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        const usernameInput = screen.getByPlaceholderText("Tài khoản");
        const passwordInput = screen.getByPlaceholderText("Mật khẩu");

        fireEvent.change(usernameInput, {
            target: { value: "admin" },
        });

        fireEvent.change(passwordInput, {
            target: { value: "123456" },
        });

        expect(usernameInput.value).toBe("admin");
        expect(passwordInput.value).toBe("123456");
    });

    test("submit login successfully", async () => {

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access: "fake_token_123",
            }),
        });

        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "http://127.0.0.1:8000/api/auth/login/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "admin",
                    password: "123456",
                }),
            }
        );

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "token",
            "fake_token_123"
        );
    });

    test("login failed", async () => {

        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                detail: "Sai tài khoản hoặc mật khẩu",
            }),
        });

        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "wrongpassword" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test("server connection error", async () => {

        global.fetch.mockRejectedValueOnce(
            new Error("Server error")
        );

        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test("button disabled when loading", async () => {

        global.fetch.mockImplementationOnce(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({
                                    access: "token",
                                }),
                            }),
                        100
                    )
                )
        );

        render(
            <BrowserRouter>
                <FormLogin />
            </BrowserRouter>
        );

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

});