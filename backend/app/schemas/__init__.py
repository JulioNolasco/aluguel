from app.schemas.user import (
    Token,
    TokenPayload,
    UserBase,
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    CustomerDocumentResponse,
)
from app.schemas.console import (
    ConsoleBase,
    ConsoleCreate,
    ConsoleUpdate,
    ConsoleResponse,
)
from app.schemas.accessory import (
    AccessoryBase,
    AccessoryCreate,
    AccessoryUpdate,
    AccessoryResponse,
)
from app.schemas.booking import (
    BookingItemCreate,
    BookingItemResponse,
    BookingSimulationRequest,
    BookingSimulationResponse,
    BookingCreate,
    BookingStatusUpdate,
    BookingResponse,
)
from app.schemas.inspection import (
    InspectionBase,
    InspectionCreate,
    InspectionResponse,
)
from app.schemas.financial import (
    FinancialTransactionBase,
    FinancialTransactionCreate,
    FinancialTransactionResponse,
    FinancialKpisResponse,
)
